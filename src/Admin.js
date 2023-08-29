import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Admin.css";

const Admin = () => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedFields, setEditedFields] = useState({});

  useEffect(() => {
    fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    )
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const rowsPerPage = 10;

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSelectRow = (rowId) => {
    const updatedSelectedRows = selectedRows.includes(rowId)
      ? selectedRows.filter((id) => id !== rowId)
      : [...selectedRows, rowId];
    setSelectedRows(updatedSelectedRows);
  };

  const handleDeleteSelected = () => {
    const newData = data.filter((row) => !selectedRows.includes(row.id));
    setData(newData);
    setSelectedRows([]);
  };

  const handleSelectAll = () => {
    const pageRowIds = data
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .map((row) => row.id);

    if (selectedRows.length === pageRowIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(pageRowIds);
    }
  };

  const handleDeleteRow = (rowId) => {
    const newData = data.filter((row) => row.id !== rowId);
    setData(newData);
    setSelectedRows(selectedRows.filter((id) => id !== rowId));
  };

  const handleEditRow = (rowId) => {
    setEditingRowId(rowId);
    const row = data.find((row) => row.id === rowId);
    setEditedFields({ name: row.name, email: row.email });
  };

  const handleEditInputChange = (field, value) => {
    setEditedFields((prevFields) => ({ ...prevFields, [field]: value }));
  };

  const handleSaveEdit = (rowId) => {
    const newData = data.map((row) => {
      if (row.id === rowId) {
        return { ...row, ...editedFields };
      }
      return row;
    });
    setData(newData);
    setEditingRowId(null);
    setEditedFields({});
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedFields({});
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = data
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(startIndex, startIndex + rowsPerPage);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginationButtons = [];

  for (let i = 1; i <= totalPages; i++) {
    paginationButtons.push(
      <button
        key={i}
        onClick={() => handlePageChange(i)}
        className={currentPage === i ? "active" : ""}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="admin-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === visibleRows.length}
                onChange={handleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr
              key={row.id}
              className={selectedRows.includes(row.id) ? "selected-row" : ""}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(row.id)}
                  onChange={() => handleSelectRow(row.id)}
                />
              </td>
              <td>
                {editingRowId === row.id ? (
                  <input
                    type="text"
                    value={editedFields.name || row.name}
                    onChange={(e) =>
                      handleEditInputChange("name", e.target.value)
                    }
                  />
                ) : (
                  row.name
                )}
              </td>
              <td>
                {editingRowId === row.id ? (
                  <input
                    type="text"
                    value={editedFields.email || row.email}
                    onChange={(e) =>
                      handleEditInputChange("email", e.target.value)
                    }
                  />
                ) : (
                  row.email
                )}
              </td>
              <td>
                {editingRowId === row.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(row.id)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <FaEdit onClick={() => handleEditRow(row.id)} />
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleDeleteRow(row.id)}
                    />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="alignment">
        <div className="pagination">{paginationButtons}</div>

        <button className="delete-selected" onClick={handleDeleteSelected}>
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default Admin;
