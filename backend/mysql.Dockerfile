FROM mysql:latest

COPY ./db/my.cnf /etc/mysql/conf.d/
COPY ./db/initdb.sql /docker-entrypoint-initdb.d/