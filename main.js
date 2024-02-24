document.addEventListener("DOMContentLoaded", function () {
	const books = [];
	const RENDER_EVENT = "render-book";
	const SAVED_EVENT = "saved-book";
	const SEARCH_EVENT = "search-book";
	const STORAGE_KEY = "TODO_APPS";

	const isStorageExist = () => {
		if (typeof Storage === undefined) {
			alert("Browser kamu tidak mendukung local storage");
			return false;
		}
		return true;
	};

	const submitForm = document.getElementById("formBook");
	submitForm.addEventListener("submit", (e) => {
		e.preventDefault();
		addBook();
	});

	const generateId = () => {
		return +new Date();
	};

	const generateBookObject = (id, title, author, year, isComplete) => {
		return {
			id,
			title,
			author,
			year,
			isComplete,
		};
	};

	const addBook = () => {
		const titleVal = document.getElementById("title").value;
		const authorVal = document.getElementById("author").value;
		const yearVal = parseInt(document.getElementById("year").value);
		const isCompleteVal = document.getElementById("isComplete").checked;

		const generatedID = generateId();
		const bookObject = generateBookObject(
			generatedID,
			titleVal,
			authorVal,
			yearVal,
			isCompleteVal
		);
		books.push(bookObject);

		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
	};

	document.addEventListener(RENDER_EVENT, () => {
		const uncompletedBookList = document.getElementById("books");
		const listCompleted = document.getElementById("completed-books");

		uncompletedBookList.innerHTML = "";
		listCompleted.innerHTML = "";

		for (const bookItem of books) {
			const bookElement = makeBook(bookItem);
			if (bookItem.isComplete) {
				listCompleted.append(bookElement);
			} else {
				uncompletedBookList.append(bookElement);
			}
		}
	});

	const makeBook = (bookObject) => {
		const listItem = document.createElement("li");
		listItem.classList.add("list-group-item");
		listItem.setAttribute("id", `book-${bookObject.id}`);

		const todoIndicator = document.createElement("div");
		todoIndicator.classList.add("todo-indicator", "bg-primary");
		listItem.appendChild(todoIndicator);

		const widgetContent = document.createElement("div");
		widgetContent.classList.add("widget-content", "p-0");
		listItem.appendChild(widgetContent);

		const widgetContentWrapper = document.createElement("div");
		widgetContentWrapper.classList.add("widget-content-wrapper");
		widgetContent.appendChild(widgetContentWrapper);

		const widgetContentLeft = document.createElement("div");
		widgetContentLeft.classList.add("widget-content-left");
		widgetContentWrapper.appendChild(widgetContentLeft);

		const titleBook = document.createElement("div");
		titleBook.classList.add("widget-heading", "title-book");
		titleBook.innerText = bookObject.title;
		widgetContentLeft.appendChild(titleBook);

		const descriptionBook = document.createElement("div");
		descriptionBook.classList.add("widget-subheading", "description-book");
		descriptionBook.innerHTML = `<i>By ${bookObject.author}</i>,  ${bookObject.year}`;
		widgetContentLeft.appendChild(descriptionBook);

		const widgetContentRight = document.createElement("div");
		widgetContentRight.classList.add("widget-content-right");
		widgetContentWrapper.appendChild(widgetContentRight);

		if (bookObject.isComplete) {
			const undoButton = document.createElement("button");
			undoButton.classList.add(
				"border-0",
				"btn-transition",
				"btn",
				"btn-outline-success",
				"undo-button"
			);

			undoButton.addEventListener("click", function () {
				addOrUndoTask(bookObject.id, "undo");
			});

			undoButton.innerHTML = `<i class="fa fa-rotate-left"></i>`;
			widgetContentRight.appendChild(undoButton);
		} else {
			const checkButton = document.createElement("button");
			checkButton.classList.add(
				"border-0",
				"btn-transition",
				"btn",
				"btn-outline-success",
				"check-button"
			);

			checkButton.addEventListener("click", function () {
				addOrUndoTask(bookObject.id, "add");
			});

			checkButton.innerHTML = `<i class="fa fa-check"></i>`;
			widgetContentRight.appendChild(checkButton);
		}

		const trashButton = document.createElement("button");
		trashButton.classList.add(
			"border-0",
			"btn-transition",
			"btn",
			"btn-outline-danger"
		);

		trashButton.addEventListener("click", function () {
			if (confirm("Apakah kamu yakin ingin menghapus data buku?")) {
				removeTaskFromCompleted(bookObject.id);
			}
		});

		trashButton.innerHTML = `<i class="fa fa-trash"></i>`;
		widgetContentRight.appendChild(trashButton);

		return listItem;
	};

	const addOrUndoTask = (bookId, method) => {
		const bookTarget = findTodo(bookId);

		if (bookTarget == null) return;

		method == "add"
			? (bookTarget.isComplete = true)
			: (bookTarget.isComplete = false);

		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
	};

	const removeTaskFromCompleted = (bookId) => {
		const bookTarget = findTodoIndex(bookId);

		if (bookTarget === -1) return;

		books.splice(bookTarget, 1);
		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
	};

	const findTodo = (bookId) => {
		for (const bookItem of books) {
			if (bookItem.id === bookId) {
				return bookItem;
			}
		}

		return null;
	};

	const findTodoIndex = (bookId) => {
		for (const index in books) {
			if (books[index].id === bookId) {
				return index;
			}
		}

		return -1;
	};

	const saveData = () => {
		if (isStorageExist()) {
			const parsed = JSON.stringify(books);
			localStorage.setItem(STORAGE_KEY, parsed);
			document.dispatchEvent(new Event(SAVED_EVENT));
		}
	};

	const loadDataFromStorage = () => {
		const serializedData = localStorage.getItem(STORAGE_KEY);
		let data = JSON.parse(serializedData);

		if (data !== null) {
			for (const book of data) {
				books.push(book);
			}
		}

		document.dispatchEvent(new Event(RENDER_EVENT));
	};

	if (isStorageExist()) {
		loadDataFromStorage();
	}

	document.addEventListener(SAVED_EVENT, () => {
		console.log("Data berhasil di simpan.");
	});

	const form = document.querySelector("#formDataSearch form");
	let foundBooks = [];

	form.addEventListener("input", function (e) {
		e.preventDefault();
		const titleToSearch = document
			.getElementById("judul")
			.value.trim()
			.toLowerCase();
		const regex = new RegExp(titleToSearch, "i");
		foundBooks = books.filter((book) => regex.test(book.title.toLowerCase()));

		document.dispatchEvent(new Event(SEARCH_EVENT));
	});

	document.addEventListener(SEARCH_EVENT, () => {
		const uncompletedBookList = document.getElementById("books");
		const listCompleted = document.getElementById("completed-books");

		uncompletedBookList.innerHTML = "";
		listCompleted.innerHTML = "";

		for (const bookItem of foundBooks) {
			const bookElement = makeBook(bookItem);
			if (bookItem.isComplete) {
				listCompleted.append(bookElement);
			} else {
				uncompletedBookList.append(bookElement);
			}
		}
	});
});
