# Use the official .NET 9.0 runtime as the base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
ARG CONFIGURATION="Development"

# Set the working directory inside the container
WORKDIR /SEBrowser

# Copy SEBrowser from the local published folder to the container
COPY ./[Bb]uild/${CONFIGURATION}/Applications/SEBrowser/net9.0/publish/linux-x64/ /SEBrowser/

ENV ASPNETCORE_HTTP_PORTS=8001

# Set permissions for all copied folders and files
RUN chmod -R 777 /SEBrowser

# Ensure the application is executable
RUN chmod +x /SEBrowser/SEBrowser

# Expose the webserver port
EXPOSE 8001

# Define the entry point to run
ENTRYPOINT ["sh", "-c", "exec /SEBrowser/SEBrowser"]
