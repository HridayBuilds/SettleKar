package com.settlekar.backend.exception;

public class BudgetCapExceededException extends RuntimeException {

    public BudgetCapExceededException(String message) {
        super(message);
    }
}
