# Stage 1: Build Stage -
# installs all dependencies, including devDependencies, to build the app.
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Copy the source code
COPY . .


# Stage 2: Production Stage -

# This stage creates the final image for production.

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app .

# Expose the application port
EXPOSE 8000

USER node

# The command to run the application
CMD [ "node", "src/index.js" ]