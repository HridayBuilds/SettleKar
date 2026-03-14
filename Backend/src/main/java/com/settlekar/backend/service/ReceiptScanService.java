package com.settlekar.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.settlekar.backend.dto.response.ReceiptScanResponse;
import com.settlekar.backend.enums.ExpenseCategory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@Slf4j
public class ReceiptScanService {

    private final S3Service s3Service;
    private final ObjectMapper objectMapper;

    @Value("${receipt-scanner.base-url}")
    private String mlBaseUrl;

    private HttpClient httpClient;

    public ReceiptScanService(S3Service s3Service, ObjectMapper objectMapper) {
        this.s3Service = s3Service;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }

    public ReceiptScanResponse scanReceipt(MultipartFile file) {
        String receiptUrl = null;
        try {
            // Upload to S3
            receiptUrl = s3Service.uploadFile(file, "receipts");
            log.info("Receipt uploaded to S3: {}", receiptUrl);

            // Generate presigned URL for ML model access
            String key = s3Service.extractKeyFromUrl(receiptUrl);
            String presignedUrl = s3Service.generatePresignedUrl(key);
            log.info("Presigned URL generated for ML model");

            // Build JSON body
            String requestBody = objectMapper.writeValueAsString(
                    java.util.Map.of("image_url", presignedUrl));
            log.info("Calling ML service at {}/api/scan-receipt", mlBaseUrl);

            // Call ML service using java.net.http.HttpClient (avoids Spring RestClient serialization issues)
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(mlBaseUrl + "/api/scan-receipt"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();
            log.info("ML service responded with status: {}", response.statusCode());

            JsonNode mlResponse = objectMapper.readTree(responseBody);

            if (mlResponse == null || !mlResponse.path("success").asBoolean(false)) {
                String error = mlResponse != null ? mlResponse.path("error").asText("Unknown error") : "No response from ML service";
                log.warn("ML scan failed: {}", error);
                return ReceiptScanResponse.builder()
                        .success(false)
                        .receiptUrl(receiptUrl)
                        .error(error)
                        .build();
            }

            JsonNode data = mlResponse.path("data");

            String description = data.path("description").asText(null);
            BigDecimal amount = data.has("amount") && !data.path("amount").isNull()
                    ? new BigDecimal(data.path("amount").asText())
                    : null;
            String category = mapCategory(data.path("category").asText(null));

            log.info("Receipt scanned: description={}, amount={}, category={}", description, amount, category);

            return ReceiptScanResponse.builder()
                    .success(true)
                    .description(description)
                    .amount(amount)
                    .category(category)
                    .receiptUrl(receiptUrl)
                    .build();

        } catch (Exception e) {
            log.error("Receipt scan failed: {}", e.getMessage(), e);
            return ReceiptScanResponse.builder()
                    .success(false)
                    .receiptUrl(receiptUrl)
                    .error("Failed to scan receipt: " + e.getMessage())
                    .build();
        }
    }

    private String mapCategory(String mlCategory) {
        if (mlCategory == null || mlCategory.isBlank()) {
            return ExpenseCategory.OTHER.name();
        }
        try {
            return ExpenseCategory.valueOf(mlCategory.toUpperCase()).name();
        } catch (IllegalArgumentException e) {
            return ExpenseCategory.OTHER.name();
        }
    }
}
