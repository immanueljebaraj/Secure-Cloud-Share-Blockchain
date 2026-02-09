package com.shadow.fyp.controller;

import com.shadow.fyp.model.AccessRequest;
import com.shadow.fyp.service.AccessRequestService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class AccessRequestController {

    private final AccessRequestService svc;

    public AccessRequestController(AccessRequestService svc) {
        this.svc = svc;
    }

    @PostMapping
    public AccessRequest create(@RequestParam Long fileId, @RequestParam(required = false) String reason) {
        return svc.createRequest(fileId, reason);
    }

    @GetMapping("/owner/{ownerId}")
    public List<AccessRequest> byOwner(@PathVariable Long ownerId) {
        return svc.findByOwner(ownerId);
    }

    @GetMapping("/requester/{requesterId}")
    public List<AccessRequest> byRequester(@PathVariable Long requesterId) {
        return svc.findByRequester(requesterId);
    }

    @PostMapping("/{id}/approve")
    public AccessRequest approve(@PathVariable Long id) throws Exception {
        return svc.approve(id);
    }

    @PostMapping("/{id}/reject")
    public AccessRequest reject(@PathVariable Long id) throws Exception {
        return svc.reject(id);
    }
}