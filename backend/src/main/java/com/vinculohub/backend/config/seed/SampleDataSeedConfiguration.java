/* (C)2026 */
package com.vinculohub.backend.config.seed;

import com.vinculohub.backend.config.seed.auth0.Auth0ManagementProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties({SampleDataSeedProperties.class, Auth0ManagementProperties.class})
public class SampleDataSeedConfiguration {}
