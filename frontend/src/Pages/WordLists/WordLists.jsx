import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const API_URL = "http://localhost:5000/api/v1/word-lists";

const WordLists = () => {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentList, setCurrentList] = useState(null);
  const { user } = useAppContext(); // Get user from context for token

  useEffect(() => {
    if (user?.token) {
      fetchLists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      // Send token in authorization header
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch lists.");
      const data = await response.json();
      setLists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { name, words } = currentList;
    const wordsArray = words
      .split("\n")
      .map((w) => w.trim())
      .filter(Boolean);

    if (!name || wordsArray.length === 0) {
      alert("Please provide a name and at least one word.");
      return;
    }

    const method = currentList._id ? "PUT" : "POST";
    const url = currentList._id ? `${API_URL}/${currentList._id}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          // Add auth header
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name, words: wordsArray }), // No need to send createdBy
      });
      if (!response.ok) throw new Error("Failed to save list.");
      await fetchLists();
      setCurrentList(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (listId) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        const response = await fetch(`${API_URL}/${listId}`, {
          method: "DELETE",
          headers: {
            // Add auth header
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to delete list.");
        await fetchLists();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (list) => {
    setCurrentList({ ...list, words: list.words.join("\n") });
  };

  const handleAddNew = () => {
    setCurrentList({ name: "", words: "" });
  };

  if (isLoading)
    return <div className="text-center p-8 dark:text-white">Loading...</div>;
  if (error)
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            My Custom Word Lists
          </h1>
          <div className="flex gap-4 self-end sm:self-auto">
            <Link to="/" className="px-4 py-2 text-blue-500 hover:underline">
              Back
            </Link>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create New
            </button>
          </div>
        </div>

        {currentList ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <form onSubmit={handleSave}>
              <h2 className="text-2xl font-semibold mb-4 dark:text-white">
                {currentList._id ? "Edit List" : "Create New List"}
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={currentList.name}
                  onChange={(e) =>
                    setCurrentList({ ...currentList, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Words (one per line)
                </label>
                <textarea
                  value={currentList.words}
                  onChange={(e) =>
                    setCurrentList({ ...currentList, words: e.target.value })
                  }
                  rows="10"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentList(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save List
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {lists.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                You haven't created any word lists yet.
              </p>
            ) : (
              lists.map((list) => (
                <div
                  key={list._id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <h3 className="text-xl font-semibold dark:text-white">
                      {list.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {list.words.length} words
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleEdit(list)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(list._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordLists;
