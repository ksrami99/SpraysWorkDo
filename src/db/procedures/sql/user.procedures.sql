CREATE PROCEDURE `getUserByEmail` (IN p_email VARCHAR(255))
BEGIN
	SELECT 
        id,
        fullname, 
        email, 
        role, 
        created_at, 
        updated_at
	FROM users WHERE email = p_email;
END

CREATE PROCEDURE `getUserById` (IN p_id INT)
BEGIN
	SELECT 
        id,
        fullname, 
        email, 
        role, 
        created_at, 
        updated_at
	FROM users where id = p_id ;
END

CREATE PROCEDURE getAllUsers ()
BEGIN
    SELECT 
        id,
        fullname, 
        email, 
        role, 
        created_at, 
        updated_at
    FROM users;
END

CREATE PROCEDURE `getUserPassword` (IN p_id INT)
BEGIN
    SELECT password FROM users WHERE id = p_id;
END

CREATE PROCEDURE updateUser (
    IN p_id INT,
    IN p_email VARCHAR(255),
    IN p_fullname VARCHAR(150),
    IN p_password VARCHAR(255)
)
BEGIN
    UPDATE users
    SET     
        email    = IF(p_email IS NULL, email, p_email),
        fullname = IF(p_fullname IS NULL, fullname, p_fullname),
        password = IF(p_password IS NULL, password, p_password)
    WHERE id = p_id;
END