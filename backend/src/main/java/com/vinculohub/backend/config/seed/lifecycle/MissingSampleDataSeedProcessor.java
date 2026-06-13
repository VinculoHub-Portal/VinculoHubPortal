/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnMissingBean(SampleDataSeedProcessor.class)
public class MissingSampleDataSeedProcessor implements SampleDataSeedProcessor {

    @Override
    public SampleDataSeedResult process(SampleDataSeedProperties properties) {
        throw new SampleDataSeedException(
                "Sample data seed is enabled, but no dataset processor is configured.");
    }
}
