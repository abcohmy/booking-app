
import React from "react";

export default function SearchBar({ search, setSearch, setPage}) {
  return (
    <div>
      <label htmlFor="search" className="block text-sm text-gray-700">搜尋</label>
      <input
        type="text"
        id="search"
        name="search"
        placeholder="姓名或日期(Bob/2025-06-30)"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}