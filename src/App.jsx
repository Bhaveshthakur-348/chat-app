import React, { useEffect, useRef, useState } from "react";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import database from "./firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import CommentForm from "./components/CommentForm";
import Comment from "./components/Comment";
import DeleteModal from "./components/DeleteModal";
import EditModal from "./components/EditModal";

const App = () => {
  const [comments, setComments] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [replyToDelete, setReplyToDelete] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingType, setEditingType] = useState("comment");
  const [editedCommentId, setEditedCommentId] = useState(null);
  const [editedReplyId, setEditedReplyId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [editedReplyText, setEditedReplyText] = useState("");

  const textareaRef = useRef(null);

  useEffect(() => {
    getDataFromFirebase();
    return () => {
      // Detach the listener when the component unmounts
      const commentsRef = ref(database, "comments");
      onValue(commentsRef, () => {});
    };
  }, []);

  useEffect(() => {
    if (showEditModal) {
      // Focus on the textarea
      textareaRef.current.focus();
      // Set the cursor position after the existing text
      const textLength = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(textLength, textLength);
    }
  }, [showEditModal]);

  const storeDataInFirebase = (newComment) => {
    push(ref(database, "comments"), newComment)
      .then(() => {
        console.log("Data stored successfully");
      })
      .catch((error) => {
        console.error("Error storing data:", error);
      });
  };

  const getDataFromFirebase = () => {
    const commentsRef = ref(database, "comments");
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Ensure that replies are initialized as an array
        const commentsWithReplies = Object.values(data).map((comment) => ({
          ...comment,
          replies: comment.replies || [], // Initialize replies as an array if it doesn't exist
        }));
        setComments(commentsWithReplies);
      } else {
        console.log("No comments found in Firebase");
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.elements.name.value;
    const commentText = e.target.elements.comment.value;

    if (!name || !commentText) {
      return toast.error("Please Provide Both Name and Comment!")
    }

    const date = new Date().toLocaleString();

    const newComment = {
      id: Date.now(),
      name: name,
      comment: commentText,
      date: date,
      replyVisible: false,
      replies: [],
    };

    // Store data in Firebase
    storeDataInFirebase(newComment);

    // Update the state with the new comment
    setComments([...comments, newComment]);
    console.log("newComment", newComment);

    // Reset form fields
    e.target.reset();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    const day = date.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
    return formattedDate.replace(/\b\d{1,2}\b/, day + suffix);
  };

  const handleReplyToggle = (commentId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replyVisible: !comment.replyVisible,
        };
      }
      return comment;
    });

    setComments(updatedComments);
  };

  const setCommentsAndUpdateDatabase = (updatedComments) => {
    // Update state with updated comments
    setComments(updatedComments);

    // Update Firebase database with updated comments
    const commentsRef = ref(database, "comments");
    set(ref(database, "comments"), updatedComments)
      .then(() => {
        console.log("Updated comments stored in Firebase");
      })
      .catch((error) => {
        console.error("Error storing updated comments:", error);
      });
  };

  const handleReply = (commentId, replyText, replyName) => {
    if(!replyName || !replyText){
      return toast.error("Please Provide Both Name and Reply!", {
        position: "bottom-center",
      })
    }

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: Date.now(),
              name: replyName,
              reply: replyText,
              date: new Date().toLocaleString(),
            },
          ],
          replyVisible: false,
        };
      }
      return comment;
    });

    // Update state and Firebase with the new reply
    setCommentsAndUpdateDatabase(updatedComments);
  };

  const handleEdit = (type, commentId, replyId) => {
    if (type === "comment") {
      const commentToEdit = comments.find(
        (comment) => comment.id === commentId
      );
      setEditedCommentId(commentId);
      setEditedCommentText(commentToEdit.comment);
    } else {
      const replyToEdit = comments
        .find((comment) => comment.id === commentId)
        .replies.find((reply) => reply.id === replyId);
      setEditedCommentId(commentId);
      setEditedReplyId(replyId);
      setEditedReplyText(replyToEdit.reply);
    }
    setEditingType(type);
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    if (editingType === "comment") {
      const updatedComments = comments.map((comment) => {
        if (comment.id === editedCommentId) {
          return {
            ...comment,
            comment: editedCommentText,
          };
        }
        return comment;
      });
      setCommentsAndUpdateDatabase(updatedComments);
    } else {
      const updatedComments = comments.map((comment) => {
        if (comment.id === editedCommentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === editedReplyId) {
                return {
                  ...reply,
                  reply: editedReplyText,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      });
      setCommentsAndUpdateDatabase(updatedComments);
    }
    setShowEditModal(false);
    setEditedCommentId(null);
    setEditedReplyId(null);
    setEditedCommentText("");
    setEditedReplyText("");
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditedCommentId(null);
    setEditedReplyId(null);
    setEditedCommentText("");
    setEditedReplyText("");
  };

  const sortComments = (comments) => {
    const sortedComments = [...comments];
    sortedComments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    return sortedComments;
  };

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    const sortedComments = sortComments(comments);
    setComments(sortedComments);
  };

  const handleDelete = (commentId, replyId) => {
    // Set the comment and reply to delete
    setCommentToDelete(commentId);
    setReplyToDelete(replyId);
    // Show the delete confirmation modal
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (replyToDelete === null) {
      // Delete the entire comment and its replies
      const updatedComments = comments.filter(
        (comment) => comment.id !== commentToDelete
      );
      setCommentsAndUpdateDatabase(updatedComments);
    } else {
      // Delete only the specific reply
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentToDelete) {
          return {
            ...comment,
            replies: comment.replies.filter(
              (reply) => reply.id !== replyToDelete
            ),
          };
        }
        return comment;
      });
      setCommentsAndUpdateDatabase(updatedComments);
    }
    // Reset the delete confirmation modal state
    setShowDeleteModal(false);
    setCommentToDelete(null);
    setReplyToDelete(null);
  };

  const cancelDelete = () => {
    // Reset the delete confirmation modal state
    setShowDeleteModal(false);
    setCommentToDelete(null);
    setReplyToDelete(null);
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <CommentForm onSubmit={handleSubmit} />
      <div className="sm: w-[370px] lg:w-[500px] p-2 rounded-md">
        {/* Sort order toggle */}
        {comments.length >= 1 && (
          <p className="text-right mb-1 font-semibold">
            Sort By:{" "}
            <span className="cursor-pointer" onClick={toggleSortOrder}>
              Date and Time 🠯
            </span>
          </p>
        )}
        {/* Comments list */}
        {comments === null ? (
          <p>Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-center">No comments found</p>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onReplyToggle={handleReplyToggle}
              onReply={handleReply}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
      {/* Edit comment/reply modal */}
      {showEditModal && (
        <EditModal
        editingType={editingType}
        editedCommentId={editedCommentId}
        editedReplyId={editedReplyId}
        editedCommentText={editedCommentText}
        editedReplyText={editedReplyText}
          onTextChange={(type, value) => {
            if (type === "comment") {
              setEditedCommentText(value);
            } else {
              setEditedReplyText(value);
            }
          }}
          confirmEdit={confirmEdit}
          cancelEdit={cancelEdit}
          textareaRef={textareaRef}
        />
      )}
      {/* Toast notifications */}
      <Toaster />
    </div>
  );

};

export default App;
