GRANT ALL PRIVILEGES ON *.* TO '{MYSQL_USER}'@'%' IDENTIFIED BY '{MYSQL_PASSWORD}' WITH GRANT OPTION;

-- Create ClickHouse CDC replication user
CREATE USER IF NOT EXISTS 'clickpipes_user'@'%' IDENTIFIED BY 'clickpipes_password';
GRANT SELECT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';

FLUSH PRIVILEGES;
