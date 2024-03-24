import React, { useEffect, useState } from "react";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import database from "./firebaseConfig";
import { RiDeleteBin5Line } from "react-icons/ri";

const App = () => {
  const [comments, setComments] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [replyToEdit, setReplyToEdit] = useState(null);

  useEffect(() => {
    getDataFromFirebase();
    return () => {
      // Detach the listener when the component unmounts
      const commentsRef = ref(database, "comments");
      onValue(commentsRef, () => {});
    };
  }, []);

  // Rest of your code...

  const handleEdit = (type, commentId, replyId) => {
    // Set the comment and reply to edit
    setCommentToEdit(commentId);
    setReplyToEdit(replyId);
    // Show the edit modal
    setShowEditModal(true);
  };

  const confirmEdit = (updatedText) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentToEdit) {
        if (replyToEdit === null) {
          return {
            ...comment,
            comment: updatedText,
          };
        } else {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === replyToEdit) {
                return {
                  ...reply,
                  reply: updatedText,
                };
              }
              return reply;
            }),
          };
        }
      }
      return comment;
    });
    // Update state and Firebase with the edited comment/reply
    setCommentsAndUpdateDatabase(updatedComments);
    // Reset the edit modal state
    setShowEditModal(false);
    setCommentToEdit(null);
    setReplyToEdit(null);
  };

  const cancelEdit = () => {
    // Reset the edit modal state
    setShowEditModal(false);
    setCommentToEdit(null);
    setReplyToEdit(null);
  };

  // Rest of your code...

  return (
    <div className="flex flex-col items-center mt-8">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-md">
            <p>Edit {replyToEdit === null ? 'Comment' : 'Reply'}:</p>
            <input
              type="text"
              defaultValue={replyToEdit === null ? comments.find(comment => comment.id === commentToEdit).comment : comments.find(comment => comment.id === commentToEdit).replies.find(reply => reply.id === replyToEdit).reply}
              className="w-full rounded-md p-2 mt-2"
              ref={editInputRef}
            />
            <div className="flex justify-between mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => confirmEdit(editInputRef.current.value)}
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

      {/* Rest of your UI */}
    </div>
  );
};

export default App;
