
import React from "react";

export default function SearchBar({ nameSearch, setNameSearch, dateSearch, setDateSearch, sortBy, setSortBy, setPage}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div>
        <label htmlFor="sortBy" className="block text-sm text-gray-700">排序方式</label>
        <select
          id="sortBy"
          name="sortBy"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="updatedAt">依修改時間（新到舊）</option>
          <option value="booking_time">依預約時間（近到遠）</option>
        </select>
      </div>
    </div>
  );
}