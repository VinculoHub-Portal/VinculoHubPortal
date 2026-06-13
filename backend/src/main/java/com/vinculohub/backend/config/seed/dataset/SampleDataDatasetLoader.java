/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SampleDataDatasetLoader {

    private final SampleDataDatasetReader reader;
    private final SampleDataDatasetValidator validator;

    public LoadedSampleDataDataset load(String location) {
        LoadedSampleDataDataset loaded = reader.read(location);
        validator.validate(loaded.dataset());
        return loaded;
    }
}
