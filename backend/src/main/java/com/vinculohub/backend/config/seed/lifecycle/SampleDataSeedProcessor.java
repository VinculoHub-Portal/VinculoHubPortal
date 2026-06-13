/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;

public interface SampleDataSeedProcessor {

    SampleDataSeedResult process(SampleDataSeedProperties properties);
}
