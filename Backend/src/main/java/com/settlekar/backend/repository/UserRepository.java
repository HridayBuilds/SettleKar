package com.settlekar.backend.repository;

import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.AuthProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByEmailAndAuthProvider(String email, AuthProvider authProvider);

    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

}
