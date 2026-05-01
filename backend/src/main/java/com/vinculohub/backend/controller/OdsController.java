/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.service.OdsService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/ods")
@RequiredArgsConstructor
public class OdsController {

    private final OdsService odsService;

    @GetMapping
    public List<OdsResponse> list() {
        return odsService.findAll().stream()
                .map(ods -> new OdsResponse(ods.getId(), ods.getName(), ods.getDescription()))
                .toList();
    }
}
