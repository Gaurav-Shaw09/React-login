import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);

    const loggedInUsername = localStorage.getItem("username");
    const loggedInUserId = localStorage.getItem("userId");

    useEffect(() => {
        if (!username) {
            loggedInUsername ? navigate(`/profile/${loggedInUsername}`, { replace: true }) : navigate("/login", { replace: true });
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/profile/${username}`);
                setProfile(response.data);
                setDescription(response.data.description || "");
                if (response.data.userId) {
                    setUserId(response.data.userId);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Profile not found.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, navigate, loggedInUsername]);

    useEffect(() => {
        const fetchUserBlogs = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(`http://localhost:8080/api/blogs/user/${userId}`);
                setBlogs(response.data);
            } catch (error) {
                console.error("Error fetching blogs:", error);
            }
        };

        fetchUserBlogs();
    }, [userId]);

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("description", description);
        if (profilePicture) {
            formData.append("profilePicture", profilePicture);
        }

        try {
            const response = await axios.put(`http://localhost:8080/api/profile/${username}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfile(response.data);
            setIsEditing(false);
            setError(null);
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("Failed to update profile. Please try again.");
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p style={styles.error}>{error}</p>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>{profile?.username}'s Profile</h1>

            <div style={styles.profilePictureContainer}>
                {profile?.profilePicture ? (
                    <img src={`http://localhost:8080/api/profile/${username}/profile-picture`} alt="Profile" style={styles.profilePicture} />
                ) : (
                    <div style={styles.placeholderPicture}>No Profile Picture</div>
                )}
            </div>

            <p style={styles.description}>{profile?.description || "No description available."}</p>

            {loggedInUsername === username && (
                <button onClick={() => setIsEditing(!isEditing)} style={styles.button}>
                    {isEditing ? "Cancel" : "Update Profile"}
                </button>
            )}

            {isEditing && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="profilePicture" style={styles.label}>Profile Picture:</label>
                        <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="description" style={styles.label}>Description:</label>
                        <textarea id="description" value={description} onChange={handleDescriptionChange} style={styles.textarea} />
                    </div>
                    <button type="submit" style={styles.button}>Save Changes</button>
                </form>
            )}

            <button onClick={() => navigate("/home")} style={styles.button}>Back to Home</button>

            <h2 style={{ textAlign: "center", marginTop: "50px" }}>My Blogs</h2>

            {blogs.length > 0 ? (
                <div style={styles.blogContainer}>
                    {blogs.map((blog) => (
                        <div key={blog._id || blog.id} style={styles.blogCard}>
                            <h3>{blog.title}</h3>
                            {blog.imagePath && (
                                <img src={`http://localhost:8080/${blog.imagePath}`} alt="Blog" style={styles.blogImage} />
                            )}
                            <button onClick={() => navigate(`/blog/${blog._id || blog.id}`, { state: { blog } })} style={styles.readMoreButton}>
                                Read More
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={styles.noBlogs}>No blogs posted yet.</p>
            )}
        </div>
    );
};

export default Profile;

const styles = {
    container: {
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: "20px 10px",
    },
    title: {
        fontSize: "2.5rem",
        color: "#222",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    profilePictureContainer: {
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        overflow: "hidden",
        marginBottom: "15px",
    },
    profilePicture: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    description: {
        fontSize: "1.2rem",
        color: "#444",
        marginBottom: "20px",
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "500px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    label: {
        fontSize: "1rem",
        color: "#333",
    },
    fileInput: {
        padding: "5px",
    },
    textarea: {
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        resize: "vertical",
    },
    blogContainer: {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)", // 5 blogs in a row
        gap: "20px",
        padding: "20px",
    },
    blogCard: {
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "400px", // Increased height for better spacing
        alignItems: "center", // Center content inside
    },
    blogImage: {
        width: "220px", // Full width of card
        height: "100%", // Increased height for better visibility
        objectFit: "cover", // Ensures the image covers the area properly
        borderRadius: "10px",
    },
    readMoreButton: {
        padding: "10px",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        transition: "0.3s",
    },
    noBlogs: {
        textAlign: "center",
        color: "#666",
    },
};