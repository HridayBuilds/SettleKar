package com.settlekar.backend.exception;

public class GroupLockedException extends RuntimeException {

    public GroupLockedException(String message) {
        super(message);
    }
}
