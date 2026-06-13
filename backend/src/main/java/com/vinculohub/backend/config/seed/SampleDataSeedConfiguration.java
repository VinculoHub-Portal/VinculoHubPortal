/* (C)2026 */
package com.vinculohub.backend.config.seed;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(SampleDataSeedProperties.class)
public class SampleDataSeedConfiguration {}
