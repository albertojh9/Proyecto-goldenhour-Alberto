package com.goldenhour.backend.repository;

import com.goldenhour.backend.model.AppUser;
import com.goldenhour.backend.model.SavedRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SavedRouteRepository extends JpaRepository<SavedRoute, Long> {
    List<SavedRoute> findByUserOrderByCreatedAtDesc(AppUser user);
}
