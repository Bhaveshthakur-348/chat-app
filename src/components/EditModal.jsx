const EditModal = ({
  editingType,
  editedCommentId,
  editedReplyId,
  editedCommentText,
  editedReplyText,
  onTextChange,
  confirmEdit,
  cancelEdit,
  textareaRef,
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md w-[400px]">
        <p>{editingType === "comment" ? "Edit Comment" : "Edit Reply"}</p>
        <textarea
          ref={textareaRef}
          className="w-full rounded-md p-2 mt-2"
          value={
            editingType === "comment" ? editedCommentText : editedReplyText
          }
          onChange={(e) => onTextChange(editingType, e.target.value)}
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
  );
};

export default EditModal;
