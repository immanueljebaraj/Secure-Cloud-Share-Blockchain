package com.shadow.fyp.repository;

import com.shadow.fyp.model.AccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccessRequestRepository extends JpaRepository<AccessRequest, Long> {
    List<AccessRequest> findByOwnerId(Long ownerId);
    List<AccessRequest> findByRequesterId(Long requesterId);
}
