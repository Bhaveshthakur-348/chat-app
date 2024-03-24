import React, { useEffect, useRef, useState } from "react";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import database from "./firebaseConfig";
import { RiDeleteBin5Line } from "react-icons/ri";

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
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const day = date.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : (day % 10 === 2 && day !== 12 ? 'nd' : (day % 10 === 3 && day !== 13 ? 'rd' : 'th'));
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
      <div className="bg-gray-100 p-4 rounded-md mb-4 border border-1">
        <form onSubmit={handleSubmit}>
          <p className="text-lg mb-1 font-semibold">Comment</p>
          <input
            type="text"
            name="name"
            className="w-full rounded-md p-2 mb-4"
            placeholder="Name"
          />
          <textarea
            name="comment"
            className="w-full rounded-md p-2 mb-4"
            placeholder="Comment"
            rows={2}
          />
          <button
            type="submit"
            className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded float-right"
          >
            Post
          </button>
        </form>
      </div>

      <div className="sm: w-[400px] lg:w-[500px] p-2  rounded-md">
        {comments.length >= 1 && (
          <p className="text-right mb-1 font-semibold">
            Sort By:{" "}
            <span className="cursor-pointer" onClick={toggleSortOrder}>
              Date and Time 🠯
            </span>
          </p>
        )}
        {comments === null ? (
          <p>Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-center">No comments found</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="mt-2">
              {/* Render comment content */}
              <div className="bg-gray-100 border border-1 p-4 rounded-md relative">
                <div className="font-semibold flex justify-between mb-[2px]">
                  <p>{comment.name}</p>
                  <p>{formatDate(comment.date)}</p>
                </div>
                <p className="mb-[2px]">{comment.comment}</p>
                <button
                  className="p-1 absolute top-1/2 -translate-y-1/2 right-[-11px] rounded-full bg-gray-800"
                  onClick={() => handleDelete(comment.id, null)}
                >
                  <RiDeleteBin5Line className="text-white h-5 w-5" />
                </button>
                <div className="flex justify-start">
                  <button
                    className="text-blue-500 font-semibold mr-3"
                    onClick={() => handleReplyToggle(comment.id)}
                  >
                    Reply
                  </button>
                  <button
                    className="text-blue-500 font-semibold"
                    onClick={() => handleEdit("comment", comment.id)}
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Reply form */}
              {comment.replyVisible && (
                <form
                  className="ml-6 p-4 bg-gray-100 mt-2 rounded-md border border-1 flex flex-col"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const replyName = e.target.elements.replyName.value;
                    const replyText = e.target.elements.replyText.value;
                    handleReply(comment.id, replyText, replyName);
                    e.target.reset();
                  }}
                >
                  <h1>Reply</h1>
                  <input
                    type="text"
                    name="replyName"
                    className="w-full rounded-md p-2 mt-2"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    name="replyText"
                    className="w-full rounded-md p-2 mt-2"
                    placeholder="Reply"
                  />
                  <button
                    type="submit"
                    className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 self-end"
                  >
                    Post
                  </button>
                </form>
              )}

              {/* Check if replies exist and if it's an array before mapping over it */}

              {comment.replies &&
                Array.isArray(comment.replies) &&
                comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="bg-gray-100 border border-1 p-4 rounded-md mt-4 ml-6 mb-3 relative"
                  >
                    <div className="font-semibold flex justify-between mb-[2px]">
                      <p>{reply.name}</p>
                      <p>{formatDate(reply.date)}</p>
                    </div>
                    <p className="mb-[2px]">{reply.reply}</p>
                    <button
                      className="text-blue-500 font-semibold"
                      onClick={() => handleEdit("reply", comment.id, reply.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="p-1 absolute top-1/2 -translate-y-1/2 right-[-11px] rounded-full bg-gray-800"
                      onClick={() => handleDelete(comment.id, reply.id)}
                    >
                      <RiDeleteBin5Line className="text-white h-5 w-5" />
                    </button>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <p>Are you sure you want to delete?</p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={confirmDelete}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                onClick={cancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-[400px]">
            <p>{editingType === "comment" ? "Edit Comment" : "Edit Reply"}</p>
            <textarea
              ref={textareaRef}
              className="w-full rounded-md p-2 mt-2"
              value={
                editingType === "comment" ? editedCommentText : editedReplyText
              }
              onChange={(e) => {
                if (editingType === "comment") {
                  setEditedCommentText(e.target.value);
                } else {
                  setEditedReplyText(e.target.value);
                }
              }}
            />
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={confirmEdit}
              >
                Save
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
