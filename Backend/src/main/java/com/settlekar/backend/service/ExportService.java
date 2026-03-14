package com.settlekar.backend.service;

import com.settlekar.backend.entity.Expense;
import com.settlekar.backend.entity.ExpenseShare;
import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExportService {

    private final ExpenseRepository expenseRepository;
    private final GroupService groupService;

    private static final AtomicInteger exportCounter = new AtomicInteger(1);

    public record CsvExportResult(byte[] data, String fileName) {}

    public CsvExportResult exportGroupExpensesCsv(UUID groupId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        List<Expense> expenses = expenseRepository.findByGroup(group);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        DateTimeFormatter fileFormatter = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

        int exportNumber = exportCounter.getAndIncrement();
        String timestamp = LocalDateTime.now().format(fileFormatter);
        String sanitizedGroupName = group.getName().replaceAll("[^a-zA-Z0-9_-]", "_");
        String fileName = sanitizedGroupName + "_" + timestamp + "_" + exportNumber + ".csv";

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);

        // Header
        writer.println("Export #," + exportNumber);
        writer.println("Group," + escape(group.getName()));
        writer.println("Exported At," + LocalDateTime.now().format(formatter));
        writer.println();
        writer.println("Date,Description,Amount,Category,Paid By,Split Method,Shares");

        // Data rows
        for (Expense expense : expenses) {
            StringBuilder shares = new StringBuilder();
            for (ExpenseShare share : expense.getShares()) {
                if (!shares.isEmpty()) shares.append("; ");
                shares.append(share.getUser().getFirstName())
                        .append(": Rs.")
                        .append(share.getShareAmount().toPlainString());
            }

            writer.printf("%s,\"%s\",%s,%s,\"%s\",%s,\"%s\"%n",
                    expense.getCreatedAt().format(formatter),
                    escape(expense.getDescription()),
                    expense.getAmount().toPlainString(),
                    expense.getCategory(),
                    escape(expense.getPaidBy().getFirstName() + " " + expense.getPaidBy().getLastName()),
                    expense.getSplitMethod(),
                    escape(shares.toString()));
        }

        writer.flush();
        writer.close();
        return new CsvExportResult(outputStream.toByteArray(), fileName);
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
