CREATE PROCEDURE `getCategoriesById` (IN p_id INT)
BEGIN
	SELECT * FROM categories where id = p_id ;
END


CREATE PROCEDURE getAllCategories ()
BEGIN
    SELECT * FROM categories;
END