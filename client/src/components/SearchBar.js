
import React from "react";

export default function SearchBar({ nameSearch, setNameSearch, dateSearch, setDateSearch, setPage}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="nameSearch" className="block text-sm text-gray-700">搜尋</label>
        <input
          type="text"
          id="nameSearch"
          name="nameSearch"
          placeholder="搜尋姓名"
          value={nameSearch}
          onChange={(e) => {
            setNameSearch(e.target.value);
            setPage(1);
          }}
          className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="dateSearch" className="block text-sm test-gray-700">選擇日期</label>
        <input 
          type="date"
          id="dateSearch"
          name="dateSearch"
          value={dateSearch}
          onChange={(e) => {
            setDateSearch(e.target.value);
            setPage(1);
          }}
          className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}