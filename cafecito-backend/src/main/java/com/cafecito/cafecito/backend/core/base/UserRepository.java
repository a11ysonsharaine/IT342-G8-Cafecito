package com.cafecito.cafecito.backend.core.base;

import com.cafecito.cafecito.backend.core.shared_models.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);

    @Modifying
    @Query("""
            update User u
               set u.name = :name,
                   u.phoneNumber = :phoneNumber
             where lower(u.email) = lower(:email)
            """)
    int updateProfileFields(String email, String name, String phoneNumber);
}
