<?php
include "user.php";

session_start();

class UserController {
    private $user;

    public function __construct() {
        $this->user = new User();
    }

    public function login($email, $password) {
        if ($this->user->login($email, $password)) {
            $_SESSION['email'] = $email;
        } else {
            echo "Login failed. Please try again.\n";
        }
    }

    public function getProfile() {
        if (!isset($_SESSION['email'])) {
            echo "You must be logged in to view your profile.\n";
            return;
        }

        return $this->user->getProfile($_SESSION['email']);
    }

    public function editProfile($newData) {
        if (!isset($_SESSION['email'])) {
            echo "You must be logged in to edit your profile.\n";
            return;
        }

        $this->user->editProfile($_SESSION['email'], $newData);
        echo "Profile updated successfully.\n";
    }

    public function resetPassword($email) {
      $host = $_SERVER['HTTP_HOST'];
      $this->user->reset_password($email, $host);
      echo "Password reset link has been sent to your email.\n";
  }

    public function logout() {
        unset($_SESSION['email']);
        echo "Logout successful.\n";
    }
}

?>
