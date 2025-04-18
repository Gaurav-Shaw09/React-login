import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiLinkedin, FiEdit2, FiTrash2, FiHeart, FiArrowRight, FiX, FiPlus } from "react-icons/fi";
import Followers from "./Followers";
import Following from "./Following";

const Profile = ({ isDarkMode }) => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);

    const loggedInUsername = localStorage.getItem("username");
    const loggedInUserId = localStorage.getItem("userId");

    useEffect(() => {
        if (!username) {
            loggedInUsername
                ? navigate(`/profile/${loggedInUsername}`, { replace: true })
                : navigate("/login", { replace: true });
            setTimeout(() => {
                window.location.reload();
            }, 1);
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/profile/${username}`);
                setProfile(response.data);
                setDescription(response.data.description || "");
                setFollowersCount(response.data.followers?.length || 0);
                setFollowingCount(response.data.following?.length || 0);
                if (response.data.userId) {
                    setUserId(response.data.userId);
                }
                const followers = response.data.followers || [];
                setIsFollowing(followers.includes(loggedInUserId));
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Profile not found.");
            }
        };

        fetchProfile();
    }, [username, navigate, loggedInUsername, loggedInUserId]);

    const fetchUserBlogs = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/blogs/user/username/${username}`);
            setBlogs(response.data);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    };

    useEffect(() => {
        if (userId) fetchUserBlogs();
    }, [userId]);

    const handleProfileNavigation = (targetUsername) => {
        navigate(`/profile/${targetUsername}`);
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await axios.post(`http://localhost:8080/api/profile/${username}/unfollow`, {
                    userId: loggedInUserId
                });
                setFollowersCount(prev => prev - 1);
                setIsFollowing(false);
            } else {
                await axios.post(`http://localhost:8080/api/profile/${username}/follow`, {
                    userId: loggedInUserId
                });
                setFollowersCount(prev => prev + 1);
                setIsFollowing(true);
            }
            setTimeout(() => {
                window.location.reload();
            }, 10);
        } catch (error) {
            console.error("Error following/unfollowing:", error);
        }
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
        setTimeout(() => {
            window.location.reload();
        }, 1);
    };

    const handleDeleteBlog = async (blogId) => {
        try {
            await axios.delete(`http://localhost:8080/api/blogs/${blogId}`, {
                data: { userId: loggedInUserId },
            });
            setBlogs(blogs.filter((blog) => blog._id !== blogId));
        } catch (error) {
            console.error("Error deleting blog:", error);
        }
        setTimeout(() => {
            window.location.reload();
        }, 1);
    };

    const handleCreateBlog = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert("Please log in to create a blog.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("author", localStorage.getItem("username"));
        formData.append("userId", userId);
        if (image) formData.append("file", image);

        try {
            await axios.post("http://localhost:8080/api/blogs", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            fetchUserBlogs();
            setTitle("");
            setContent("");
            setImage(null);
            setShowModal(false);
        } catch (error) {
            console.error("Error creating blog:", error);
        }
    };

    const handleLike = async (blogId) => {
        try {
            await axios.post(`http://localhost:8080/api/blogs/${blogId}/like`, null, {
                params: { userId: loggedInUserId }
            });
            fetchUserBlogs();
        } catch(error) {
            console.error("Error liking blog:", error);
        }
    };

    const fetchFollowers = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/profile/${username}/followers`);
            setFollowersList(response.data);
            setShowFollowers(true);
        } catch (error) {
            console.error("Error fetching followers:", error);
        }
    };

    const fetchFollowing = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/profile/${username}/following`);
            setFollowingList(response.data);
            setShowFollowing(true);
        } catch (error) {
            console.error("Error fetching following:", error);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    const cardVariants = {
        hover: {
            y: -5,
            boxShadow: isDarkMode 
                ? '0 10px 25px rgba(129, 140, 248, 0.3)' 
                : '0 10px 25px rgba(99, 102, 241, 0.2)'
        }
    };

    if (error) return (
        <div style={{
            ...styles.errorContainer,
            background: isDarkMode ? '#0f172a' : '#f8fafc'
        }}>
            <div style={{
                ...styles.errorCard,
                background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'white',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)'
            }}>
                <h2 style={{
                    ...styles.errorTitle,
                    color: isDarkMode ? '#e2e8f0' : '#ef4444'
                }}>Oops!</h2>
                <p style={{
                    ...styles.errorText,
                    color: isDarkMode ? 'rgba(226, 232, 240, 0.7)' : '#6b7280'
                }}>{error}</p>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/home")} 
                    style={{
                        ...styles.errorButton,
                        background: isDarkMode ? '#818cf8' : '#6366f1'
                    }}
                >
                    Return Home
                </motion.button>
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                ...styles.container,
                background: isDarkMode 
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: isDarkMode ? '#e2e8f0' : '#1e293b'
            }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.header 
                style={{
                    ...styles.header,
                    background: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)'
                }}
                variants={itemVariants}
            >
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/home")} 
                    style={{
                        ...styles.backButton,
                        background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                        color: isDarkMode ? '#e2e8f0' : '#1e293b',
                        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)'
                    }}
                >
                    ← Back to Home
                </motion.button>
                
                <motion.h1 
                    style={{
                        ...styles.title,
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                    }}
                >
                    <span style={{
                        background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{profile?.username}'s</span> Profile
                </motion.h1>
                
                {loggedInUsername === username && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)}
                        style={{
                            ...styles.createButton,
                            background: isDarkMode ? '#818cf8' : '#6366f1'
                        }}
                    >
                        <FiPlus style={{ marginRight: '8px' }} />
                        New Blog
                    </motion.button>
                )}
            </motion.header>

            <motion.section 
                style={styles.profileBannerSection}
                variants={itemVariants}
            >
                <div style={{
                    ...styles.bannerContainer,
                    backgroundImage: isDarkMode 
                        ? `linear-gradient(rgba(15, 23, 42, 0), rgba(15, 23, 42, 0.15)), url(https://images.unsplash.com/photo-1528756514091-dee5ecaa3278?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`
                        : `linear-gradient(rgba(245, 245, 245, 0), rgba(245, 245, 245, 0.12)), url(https://images.unsplash.com/photo-1528756514091-dee5ecaa3278?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`
                }}>
                    <motion.div 
                        whileHover={{ scale: 1.03 }}
                        style={{
                            ...styles.profilePictureContainer,
                            border: isDarkMode ? '6px solid rgba(30, 41, 59, 0.8)' : '6px solid white'
                        }}
                    >
                        {profile?.profilePicture ? (
                            <img
                                src={`http://localhost:8080/api/profile/${username}/profile-picture`}
                                alt="Profile"
                                style={styles.profilePicture}
                            />
                        ) : (
                            <div style={{
                                ...styles.placeholderPicture,
                                background: isDarkMode ? '#1e293b' : '#e5e7eb'
                            }}>
                                <div style={{
                                    ...styles.initials,
                                    color: isDarkMode ? '#64748b' : '#9ca3af'
                                }}>
                                    {profile?.username?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                <div style={styles.profileInfoContainer}>
                    <motion.div 
                        style={{
                            ...styles.profileInfo,
                            background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                            backdropFilter: 'blur(10px)'
                        }}
                        variants={cardVariants}
                    >
                        <h2 style={{
                            ...styles.username,
                            color: isDarkMode ? '#e2e8f0' : '#1e293b'
                        }}>{profile?.username}</h2>
                        <div style={styles.followStats}>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    ...styles.followCountButton,
                                    color: isDarkMode ? '#e2e8f0' : '#4b5563'
                                }}
                                onClick={fetchFollowers}
                            >
                                <strong>{followersCount}</strong> Followers
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    ...styles.followCountButton,
                                    color: isDarkMode ? '#e2e8f0' : '#4b5563'
                                }}
                                onClick={fetchFollowing}
                            >
                                <strong>{followingCount}</strong> Following
                            </motion.button>
                        </div>
                        <p style={{
                            ...styles.description,
                            color: isDarkMode ? 'rgba(226, 232, 240, 0.7)' : '#6b7280'
                        }}>
                            {profile?.description || "No description yet. Share something about yourself!"}
                        </p>
                        
                        <div style={styles.profileActions}>
                            {loggedInUsername === username ? (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setIsEditing(!isEditing)}
                                    style={{
                                        ...(isEditing ? styles.cancelButton : styles.editButton),
                                        background: isEditing 
                                            ? (isDarkMode ? '#334155' : '#6b7280')
                                            : (isDarkMode ? '#818cf8' : '#6366f1')
                                    }}
                                >
                                    {isEditing ? "Cancel Editing" : "Edit Profile"}
                                </motion.button>
                            ) : (
                                loggedInUserId && (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleFollow}
                                        style={{
                                            ...(isFollowing ? styles.unfollowButton : styles.followButton),
                                            background: isFollowing 
                                                ? (isDarkMode ? '#334155' : '#e5e7eb')
                                                : (isDarkMode ? '#818cf8' : '#6366f1'),
                                            color: isFollowing 
                                                ? (isDarkMode ? '#e2e8f0' : '#374151')
                                                : 'white'
                                        }}
                                    >
                                        {isFollowing ? "Unfollow" : "Follow"}
                                    </motion.button>
                                )
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            <AnimatePresence>
                {isEditing && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        style={{
                            ...styles.editForm,
                            background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <div style={styles.formGroup}>
                            <label htmlFor="profilePicture" style={{
                                ...styles.label,
                                color: isDarkMode ? '#e2e8f0' : '#374151'
                            }}>
                                Profile Picture
                            </label>
                            <div style={styles.fileInputContainer}>
                                <motion.label 
                                    htmlFor="profilePicture" 
                                    style={{
                                        ...styles.fileInputLabel,
                                        background: isDarkMode ? '#334155' : '#f3f4f6',
                                        color: isDarkMode ? '#e2e8f0' : '#374151'
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Choose File
                                </motion.label>
                                <input 
                                    type="file" 
                                    id="profilePicture" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    style={styles.fileInput} 
                                />
                                <span style={{
                                    ...styles.fileName,
                                    color: isDarkMode ? 'rgba(226, 232, 240, 0.7)' : '#6b7280'
                                }}>
                                    {profilePicture ? profilePicture.name : "No file selected"}
                                </span>
                            </div>
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label htmlFor="description" style={{
                                ...styles.label,
                                color: isDarkMode ? '#e2e8f0' : '#374151'
                            }}>
                                About Me
                            </label>
                            <textarea 
                                id="description" 
                                value={description} 
                                onChange={handleDescriptionChange} 
                                style={{
                                    ...styles.textarea,
                                    background: isDarkMode ? '#1e293b' : 'white',
                                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                                    color: isDarkMode ? '#e2e8f0' : '#1e293b'
                                }}
                                placeholder="Tell your story..."
                            />
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            style={{
                                ...styles.saveButton,
                                background: isDarkMode ? '#10b981' : '#10b981'
                            }}
                        >
                            Save Changes
                        </motion.button>
                    </motion.form>
                )}
            </AnimatePresence>

            <motion.section 
                style={styles.blogsSection}
                variants={itemVariants}
            >
                <motion.h2 
                    style={{
                        ...styles.sectionTitle,
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                    }}
                >
                    {profile?.username}'s Blog Posts
                </motion.h2>
                
                {blogs.length > 0 ? (
                    <div style={styles.blogGrid}>
                        {blogs.map((blog) => (
                            <motion.article
                                key={blog._id || blog.id}
                                style={{
                                    ...styles.blogCard,
                                    background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                variants={cardVariants}
                                whileHover="hover"
                                transition={{ duration: 0.3 }}
                            >
                                {blog.imagePath && (
                                    <div style={styles.blogImageContainer}>
                                        <img 
                                            src={`http://localhost:8080/${blog.imagePath}`} 
                                            alt="Blog" 
                                            style={styles.blogImage}
                                            onClick={() => navigate(`/blog/${blog._id || blog.id}`, { state: { blog } })}
                                        />
                                    </div>
                                )}
                                
                                <div style={styles.blogContent}>
                                    <div style={styles.blogHeader}>
                                        <h3 style={{
                                            ...styles.blogTitle,
                                            color: isDarkMode ? '#e2e8f0' : '#1e293b'
                                        }}>{blog.title}</h3>
                                        {loggedInUsername === blog.author && (
                                            <div style={styles.menuContainer}>
                                                <motion.button
                                                    style={{
                                                        ...styles.menuButton,
                                                        color: isDarkMode ? '#e2e8f0' : '#6b7280'
                                                    }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setMenuOpen(menuOpen === blog._id ? null : blog._id)}
                                                >
                                                    ⋮
                                                </motion.button>
                                                {menuOpen === blog._id && (
                                                    <div style={{
                                                        ...styles.menuDropdown,
                                                        background: isDarkMode ? '#1e293b' : 'white',
                                                        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)'
                                                    }}>
                                                        <motion.button
                                                            style={{
                                                                ...styles.menuItem,
                                                                color: isDarkMode ? '#e2e8f0' : '#374151'
                                                            }}
                                                            whileHover={{ 
                                                                background: isDarkMode ? '#334155' : '#f3f4f6'
                                                            }}
                                                            onClick={() => navigate(`/edit-blog/${blog._id || blog.id}`)}
                                                        >
                                                            <FiEdit2 style={{ marginRight: '8px' }} />
                                                            Edit
                                                        </motion.button>
                                                        <motion.button
                                                            style={{
                                                                ...styles.menuItem,
                                                                color: isDarkMode ? '#e2e8f0' : '#374151'
                                                            }}
                                                            whileHover={{ 
                                                                background: isDarkMode ? '#334155' : '#f3f4f6'
                                                            }}
                                                            onClick={() => handleDeleteBlog(blog._id || blog.id)}
                                                        >
                                                            <FiTrash2 style={{ marginRight: '8px' }} />
                                                            Delete
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p style={{
                                        ...styles.blogExcerpt,
                                        color: isDarkMode ? 'rgba(226, 232, 240, 0.7)' : '#6b7280'
                                    }}>
                                        {blog.content.length > 120 
                                            ? `${blog.content.substring(0, 120)}...` 
                                            : blog.content}
                                    </p>
                                    
                                    <div style={styles.blogFooter}>
                                        <div style={styles.blogMeta}>
                                            <span style={{
                                                ...styles.blogAuthor,
                                                color: isDarkMode ? 'rgba(226, 232, 240, 0.7)' : '#9ca3af'
                                            }}>By {blog.author}</span>
                                            <span style={{
                                                ...styles.blogDate,
                                                color: isDarkMode ? 'rgba(226, 232, 240, 0.5)' : '#9ca3af'
                                            }}>Posted on {new Date(blog.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <div style={styles.blogActions}>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleLike(blog._id || blog.id)} 
                                                style={{
                                                    ...(blog.likedUsers && blog.likedUsers.includes(loggedInUserId) 
                                                        ? styles.likedButton 
                                                        : styles.likeButton),
                                                    background: blog.likedUsers && blog.likedUsers.includes(loggedInUserId)
                                                        ? (isDarkMode ? '#7f1d1d' : '#fecaca')
                                                        : (isDarkMode ? '#334155' : '#f3f4f6'),
                                                    color: blog.likedUsers && blog.likedUsers.includes(loggedInUserId)
                                                        ? (isDarkMode ? '#fecaca' : '#dc2626')
                                                        : (isDarkMode ? '#e2e8f0' : '#374151')
                                                }}
                                            >
                                                <FiHeart style={{ marginRight: '5px' }} />
                                                {blog.likes || 0}
                                            </motion.button>
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => navigate(`/blog/${blog._id || blog.id}`, { state: { blog } })}
                                                style={{
                                                    ...styles.readMoreButton,
                                                    border: isDarkMode ? '1px solid #818cf8' : '1px solid #6366f1',
                                                    color: isDarkMode ? '#818cf8' : '#6366f1'
                                                }}
                                            >
                                                Read More <FiArrowRight style={{ marginLeft: '5px' }} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        style={{
                            ...styles.noBlogsContainer,
                            background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                            backdropFilter: 'blur(10px)'
                        }}
                        whileHover={{ y: -5 }}
                    >
                        <div style={styles.noBlogsIllustration}>
                            <div style={styles.pencilIcon}>✏️</div>
                            <div style={styles.paperIcon}>📄</div>
                        </div>
                        <h3 style={{
                            ...styles.noBlogsTitle,
                            color: isDarkMode ? '#e2e8f0' : '#1e293b'
                        }}>No Blogs Yet</h3>
                        <p style={{
                            ...styles.noBlogsText,
                            color: isDarkMode ? 'rgba(226, 232, 240, 0.7)' : '#6b7280'
                        }}>
                            {loggedInUsername === username 
                                ? "You haven't written any blogs yet. Share your thoughts with the world!"
                                : "This user hasn't published any blogs yet."}
                        </p>
                        {loggedInUsername === username && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowModal(true)}
                                style={{
                                    ...styles.createFirstBlogButton,
                                    background: isDarkMode ? '#818cf8' : '#6366f1'
                                }}
                            >
                                Create Your First Blog
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </motion.section>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            style={{
                                ...styles.modal,
                                background: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'white',
                                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <div style={{
                                ...styles.modalHeader,
                                borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb'
                            }}>
                                <h2 style={{
                                    ...styles.modalTitle,
                                    color: isDarkMode ? '#e2e8f0' : '#111827'
                                }}>Create New Blog</h2>
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowModal(false)} 
                                    style={{
                                        ...styles.modalCloseButton,
                                        color: isDarkMode ? '#e2e8f0' : '#6b7280'
                                    }}
                                >
                                    <FiX />
                                </motion.button>
                            </div>
                            
                            <form onSubmit={handleCreateBlog} style={styles.modalForm}>
                                <div style={styles.formGroup}>
                                    <label style={{
                                        ...styles.modalLabel,
                                        color: isDarkMode ? '#e2e8f0' : '#374151'
                                    }}>Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter a captivating title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        style={{
                                            ...styles.modalInput,
                                            background: isDarkMode ? '#1e293b' : 'white',
                                            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                                            color: isDarkMode ? '#e2e8f0' : '#1e293b'
                                        }}
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={{
                                        ...styles.modalLabel,
                                        color: isDarkMode ? '#e2e8f0' : '#374151'
                                    }}>Content</label>
                                    <textarea
                                        placeholder="Write your amazing content here..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                        style={{
                                            ...styles.modalTextarea,
                                            background: isDarkMode ? '#1e293b' : 'white',
                                            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                                            color: isDarkMode ? '#e2e8f0' : '#1e293b'
                                        }}
                                        rows={8}
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={{
                                        ...styles.modalLabel,
                                        color: isDarkMode ? '#e2e8f0' : '#374151'
                                    }}>Featured Image</label>
                                    <div style={styles.fileInputContainer}>
                                        <motion.label
                                            htmlFor="blogImage" 
                                            style={{
                                                ...styles.fileInputLabel,
                                                background: isDarkMode ? '#334155' : '#f3f4f6',
                                                color: isDarkMode ? '#e2e8f0' : '#374151'
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Choose Image
                                        </motion.label>
                                        <input
                                            type="file"
                                            id="blogImage"
                                            accept="image/*"
                                            onChange={(e) => setImage(e.target.files[0])}
                                            style={styles.fileInput}
                                        />
                                        <span style={{
                                            ...styles.fileName,
                                            color: isDarkMode ? 'rgba(226, 232, 240, 0.7)' : '#6b7280'
                                        }}>
                                            {image ? image.name : "No file selected"}
                                        </span>
                                    </div>
                                </div>
                                
                                <div style={styles.modalButtons}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button" 
                                        onClick={() => setShowModal(false)} 
                                        style={{
                                            ...styles.cancelModalButton,
                                            background: isDarkMode ? '#334155' : '#f3f4f6',
                                            color: isDarkMode ? '#e2e8f0' : '#374151'
                                        }}
                                    >
                                        Cancel
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit" 
                                        style={{
                                            ...styles.submitButton,
                                            background: isDarkMode ? '#818cf8' : '#6366f1'
                                        }}
                                    >
                                        Publish Blog
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Followers 
                username={username}
                followers={followersList}
                isOpen={showFollowers}
                onClose={() => setShowFollowers(false)}
                onProfileClick={handleProfileNavigation}
                isDarkMode={isDarkMode}
            />
            <Following 
                username={username}
                following={followingList}
                isOpen={showFollowing}
                onClose={() => setShowFollowing(false)}
                onProfileClick={handleProfileNavigation}
                isDarkMode={isDarkMode}
            />
        </motion.div>
    );
};

const styles = {
    container: {
        width: "100%",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        paddingBottom: "60px",
        transition: 'background-color 0.3s ease, color 0.3s ease'
    },
    errorContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        padding: "20px",
    },
    errorCard: {
        borderRadius: "12px",
        padding: "40px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
        textAlign: "center",
        maxWidth: "500px",
        width: "100%",
        backdropFilter: 'blur(10px)'
    },
    errorTitle: {
        fontSize: "2rem",
        marginBottom: "20px",
    },
    errorText: {
        fontSize: "1.1rem",
        marginBottom: "30px",
        lineHeight: "1.6",
    },
    errorButton: {
        padding: "12px 24px",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "500",
        transition: "all 0.2s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        position: "sticky",
        top: 0,
        zIndex: 100,
    },
    backButton: {
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.95rem",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s ease",
        backdropFilter: 'blur(10px)'
    },
    title: {
        fontSize: "1.8rem",
        fontWeight: "700",
        margin: 0,
    },
    createButton: {
        padding: "10px 20px",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.95rem",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s ease",
    },
    profileBannerSection: {
        position: "relative",
        width: "100%",
        marginBottom: "40px",
    },
    bannerContainer: {
        width: "100%",
        height: "300px",
        backgroundPosition: "center",
        backgroundSize: "cover", 
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    profilePictureContainer: {
        width: "180px",
        height: "180px",
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        zIndex: 200,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    },
    profilePicture: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    placeholderPicture: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    initials: {
        fontSize: "5rem",
        fontWeight: "bold",
    },
    profileInfoContainer: {
        maxWidth: "800px",
        margin: "-90px auto 0",
        padding: "0 20px",
        position: "relative",
        zIndex: 3,
    },
    profileInfo: {
        borderRadius: "12px",
        padding: "30px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        backdropFilter: 'blur(10px)'
    },
    username: {
        fontSize: "2rem",
        fontWeight: "700",
        margin: "0 0 15px 0",
        letterSpacing: "-0.5px",
    },
    followStats: {
        display: "flex",
        gap: "25px",
        justifyContent: "center",
        marginBottom: "20px",
    },
    followCountButton: {
        fontSize: "1.1rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "5px 12px",
        transition: "color 0.2s ease",
        fontWeight: "500",
    },
    description: {
        fontSize: "1.15rem",
        lineHeight: "1.7",
        maxWidth: "600px",
        margin: "0 auto 25px",
    },
    profileActions: {
        marginTop: "20px",
    },
    editButton: {
        padding: "12px 28px",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 10px rgba(99, 102, 241, 0.3)",
    },
    cancelButton: {
        padding: "12px 28px",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
    },
    followButton: {
        padding: "12px 28px",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 10px rgba(99, 102, 241, 0.3)",
    },
    unfollowButton: {
        padding: "12px 28px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
    },
    editForm: {
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        margin: "20px auto",
        maxWidth: "600px",
        overflow: "hidden",
        backdropFilter: 'blur(10px)'
    },
    formGroup: {
        marginBottom: "20px",
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
    },
    fileInputContainer: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "15px",
    },
    fileInputLabel: {
        padding: "10px 15px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "500",
        transition: "all 0.2s ease",
    },
    fileInput: {
        display: "none",
    },
    fileName: {
        fontSize: "0.9rem",
    },
    textarea: {
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        resize: "vertical",
        minHeight: "120px",
        fontSize: "1rem",
        fontFamily: "inherit",
        lineHeight: "1.5",
        transition: "all 0.2s ease",
    },
    saveButton: {
        padding: "12px 24px",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "500",
        width: "100%",
        transition: "all 0.2s ease",
    },
    blogsSection: {
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    sectionTitle: {
        fontSize: "1.6rem",
        fontWeight: "700",
        marginBottom: "30px",
        textAlign: "center",
    },
    blogGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "25px",
    },
    blogCard: {
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        backdropFilter: 'blur(10px)'
    },
    blogImageContainer: {
        width: "100%",
        height: "200px",
        overflow: "hidden",
    },
    blogImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        cursor: "pointer",
        transition: "transform 0.3s ease",
    },
    blogContent: {
        padding: "20px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    blogHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "15px",
    },
    blogTitle: {
        fontSize: "1.3rem",
        fontWeight: "600",
        margin: 0,
        flex: 1,
    },
    menuContainer: {
        position: "relative",
    },
    menuButton: {
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "1.2rem",
        padding: "5px 10px",
    },
    menuDropdown: {
        position: "absolute",
        right: 0,
        top: "100%",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 10,
        minWidth: "120px",
        overflow: "hidden",
    },
    menuItem: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "10px 15px",
        textAlign: "left",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "0.9rem",
        transition: "all 0.2s ease",
    },
    blogExcerpt: {
        lineHeight: "1.6",
        marginBottom: "20px",
        flex: 1,
    },
    blogFooter: {
        marginTop: "auto",
    },
    blogMeta: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "15px",
        fontSize: "0.85rem",
    },
    blogAuthor: {
        fontWeight: "500",
    },
    blogDate: {
        fontStyle: "italic",
    },
    blogActions: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    likeButton: {
        padding: "8px 16px",
        border: "none",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        transition: "all 0.2s ease",
    },
    likedButton: {
        padding: "8px 16px",
        border: "none",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        transition: "all 0.2s ease",
    },
    readMoreButton: {
        padding: "8px 16px",
        backgroundColor: "transparent",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "500",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
    },
    noBlogsContainer: {
        borderRadius: "12px",
        padding: "40px 20px",
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        backdropFilter: 'blur(10px)'
    },
    noBlogsIllustration: {
        position: "relative",
        width: "150px",
        height: "150px",
        margin: "0 auto 30px",
    },
    pencilIcon: {
        position: "absolute",
        top: 0,
        left: 0,
        fontSize: "60px",
        transform: "rotate(-15deg)",
    },
    paperIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        fontSize: "60px",
        transform: "rotate(10deg)",
    },
    noBlogsTitle: {
        fontSize: "1.5rem",
        fontWeight: "600",
        marginBottom: "10px",
    },
    noBlogsText: {
        fontSize: "1.1rem",
        marginBottom: "25px",
        maxWidth: "500px",
        marginLeft: "auto",
        marginRight: "auto",
        lineHeight: "1.6",
    },
    createFirstBlogButton: {
        padding: "12px 24px",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "500",
        transition: "all 0.2s ease",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(5px)",
    },
    modal: {
        borderRadius: "12px",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        backdropFilter: 'blur(10px)'
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        borderBottom: "1px solid #e5e7eb",
    },
    modalTitle: {
        fontSize: "1.5rem",
        fontWeight: "600",
        margin: 0,
    },
    modalCloseButton: {
        backgroundColor: "transparent",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        padding: "5px",
        display: "flex",
        alignItems: "center",
    },
    modalForm: {
        padding: "20px",
    },
    modalLabel: {
        display: "block",
        marginBottom: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
    },
    modalInput: {
        width: "100%",
        padding: "12px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        fontSize: "1rem",
        marginBottom: "20px",
        transition: "all 0.2s ease",
    },
    modalTextarea: {
        width: "100%",
        padding: "12px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        fontSize: "1rem",
        marginBottom: "20px",
        resize: "vertical",
        fontFamily: "inherit",
        lineHeight: "1.5",
        minHeight: "150px",
        transition: "all 0.2s ease",
    },
    modalButtons: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "15px",
        marginTop: "20px",
    },
    submitButton: {
        padding: "12px 24px",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "500",
        transition: "all 0.2s ease",
    },
    cancelModalButton: {
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "500",
        transition: "all 0.2s ease",
    },
};

export default Profile;