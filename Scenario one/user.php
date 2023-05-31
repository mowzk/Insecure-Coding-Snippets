<?php
class Database {
    private $conn;

    public function __construct() {
        $this->conn = new mysqli("localhost", "username", "password", "database");

        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        }
    }

    public function query($sql, $params) {
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param(...$params);
        $stmt->execute();

        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            return $result->fetch_all(MYSQLI_ASSOC);
        } else {
            return null;
        }
    }

    public function close() {
        $this->conn->close();
    }
}

class Mailer {
    public function send($to, $subject, $body) {
        $headers = 'From: no-reply@example.com' . "\r\n" .
            'Reply-To: no-reply@example.com' . "\r\n" .
            'X-Mailer: PHP/' . phpversion();

        mail($to, $subject, $body, $headers);
    }
}

class User {
    private $db;
    private $mailer;

    public $email;
    public $password;
    public $reset_token;
    public $reset_expiry;

    public function __construct() {
        $this->db = new Database();
        $this->mailer = new Mailer();
    }

    public function __destruct() {
        $this->db->close();
    }

    public function login($email, $password) {
        $sql = "SELECT * FROM users WHERE email = ?";
        $users = $this->db->query($sql, ["s", $email]);

        if ($users && password_verify($password, $users[0]['password'])) {
            echo "User logged in successfully";
            return true;
        }

        echo "Invalid login credentials";
        return false;
    }

    public function getProfile($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        return $this->db->query($sql, ["s", $email]);
    }

    public function editProfile($email, $newData) {
        foreach ($newData as $field => $value) {
            $sql = "UPDATE users SET $field = ? WHERE email = ?";
            $this->db->query($sql, ['ss', $value, $email]);
        }
    }

    function reset_password($email, $host) {
        $token = bin2hex(random_bytes(32));
        $expiry_time = time() + 3600; // 1 hour
        $this->editProfile($email, array('reset_token' => $token, 'reset_expiry' => $expiry_time));

        $reset_link = "https://" . $host . "/reset.php?email=$email&token=$token";
        $body = "Dear user,\n\nTo reset your password, please click the following link:\n$reset_link\n\nThank you.";
        
        $this->mailer->send($email, "Password reset", $body);
    }
}

?>
