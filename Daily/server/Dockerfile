FROM gradle:9.2.1-jdk21

WORKDIR /app
COPY . /app

EXPOSE 8080

CMD ["gradle", ":server:run", "--no-daemon"]