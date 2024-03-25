const DeleteModal = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md">
        <p>Are you sure you want to delete?</p>
        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            onClick={onCancel}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
