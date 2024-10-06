# Use the Eclipse Temurin 17 JDK on Alpine Linux as the base image for lightweight builds
FROM eclipse-temurin:17

# Create a volume for storing temporary files used by the Spring Boot application
VOLUME /tmp

# Expose the default port that Spring Boot uses
EXPOSE 8080

# Set an environment variable for the active Spring profile (optional)
# Uncomment and modify this line if you want to use specific profiles
# ENV SPRING_PROFILES_ACTIVE=prod

# Copy the built JAR file from the target directory to the container's file system
COPY target/*.jar Chess-0.0.1-SNAPSHOT.jar

# Define the entrypoint command to run the Spring Boot application
ENTRYPOINT ["java", "-jar", "Chess-0.0.1-SNAPSHOT.jar"]

# Optional: Add a health check to ensure the application is running
# Uncomment the following lines if you have an endpoint like /actuator/health
# HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8080/actuator/health || exit 1