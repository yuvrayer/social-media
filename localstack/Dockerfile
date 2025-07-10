FROM localstack/localstack:latest

# Copy startup scripts to the folder LocalStack will run automatically
COPY init-scripts/ /etc/localstack/init/ready.d/

# Copy your local image files or other resources into the container
COPY images/ /init-resources/