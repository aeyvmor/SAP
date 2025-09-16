# Base image with Python 3.12
FROM mcr.microsoft.com/devcontainers/python:3.12

# Install Node.js via nvm, pnpm, and PostgreSQL
RUN apt-get update && \
    apt-get install -y curl gnupg2 lsb-release postgresql postgresql-contrib && \
    curl -fsSL https://get.pnpm.io/install.sh | bash && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Set up nvm and install Node.js
ENV NVM_DIR=/root/.nvm
RUN bash -c "source $NVM_DIR/nvm.sh && nvm install --lts && nvm use --lts"

# Add nvm and pnpm to PATH
ENV PATH=$NVM_DIR/versions/node/$(bash -c "source $NVM_DIR/nvm.sh && nvm version --lts")/bin:$PATH
ENV PATH=/root/.local/share/pnpm:$PATH

# Set up PostgreSQL
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER dev WITH SUPERUSER PASSWORD 'devpass';" && \
    createdb -O dev devdb
USER vscode
