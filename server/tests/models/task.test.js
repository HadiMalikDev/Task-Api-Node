const knex = require("../../database/connection");
const User = require("../../models/user");
const Task = require("../../models/task");
const {
  TASK_TABLE_NAME,
  EMPTY_FIELD,
  USER_TABLE_NAME,
  USER_NOT_FOUND,
  OPERATION_FAILED,
  INVALID_EMAIL,
  INVALID_TITLE,
  INVALID_DESCRIPTION,
  EXTRA_PARAMETERS,
  INVALID_COMPLETED,
  INVALID_ID,
  TASK_NOT_FOUND,
} = require("../../models/helpers/consts");

beforeAll(async () => {
  if (await knex.schema.hasTable(USER_TABLE_NAME))
    await knex(USER_TABLE_NAME).del();
  await User.createUser("Hadi", "test@email.com", "Hadi1234");
  if (await knex.schema.hasTable(TASK_TABLE_NAME))
    await knex(TASK_TABLE_NAME).del();
});
afterAll(async () => {
  await knex(TASK_TABLE_NAME).del();
});
describe("Test Task Model", () => {
  describe("Test Create Task function", () => {
    test("Create Task if correct parameters specified with valid email", async () => {
      await Task.createTask("New task", "Description", "test@email.com");
      const tasks = await Task.getTasks("test@email.com");
      expect(tasks.length).toBe(1);
      expect(tasks[0]).toMatchObject({
        title: "New task",
        description: "Description",
        owner: "test@email.com",
        completed: 0,
      });
    });
    describe("Throw error if incorrect fields specified", () => {
      beforeAll(async () => {
        await knex(TASK_TABLE_NAME).del();
      });
      test("Throw error if no title", async () => {
        expect.assertions(1);
        try {
          await Task.createTask("", "New Task", "test@email.com");
        } catch (error) {
          expect(error.message).toBe(EMPTY_FIELD);
        }
      });
      test("Throw error if no description", async () => {
        expect.assertions(1);
        try {
          await Task.createTask("Hadi", "", "test@email.com");
        } catch (error) {
          expect(error.message).toBe(EMPTY_FIELD);
        }
      });
      test("Throw error if no owner", async () => {
        expect.assertions(1);
        try {
          await Task.createTask("Hadi", "Desc", "");
        } catch (error) {
          expect(error.message).toBe(EMPTY_FIELD);
        }
      });
      test("Throw error if nothing specified", async () => {
        expect.assertions(1);
        try {
          await Task.createTask();
        } catch (error) {
          expect(error.message).toBe(EMPTY_FIELD);
        }
      });
      describe("Throw error if incorrect parameter type specified", () => {
        test("Incorrect title type", async () => {
          expect.assertions(1);
          try {
            await Task.createTask(3443, "Desc", "test@email.com");
          } catch (error) {
            expect(error.message).toBe(INVALID_TITLE);
          }
        });
        test("Incorrect description type", async () => {
          expect.assertions(1);
          try {
            await Task.createTask("Title", 342, "test@email.com");
          } catch (error) {
            expect(error.message).toBe(INVALID_DESCRIPTION);
          }
        });
        test("Incorrect owner type", async () => {
          expect.assertions(1);
          try {
            await Task.createTask("Title", "desc", 432432);
          } catch (error) {
            expect(error.message).toBe(INVALID_EMAIL);
          }
        });
      });
      test("Throw error if correct parameters with non-existent email specified", async () => {
        expect.assertions(1);
        try {
          await Task.createTask("Hadi", "Desc", "rip@email.com");
        } catch (error) {
          expect(error.message).toBe(USER_NOT_FOUND);
        }
      });
    });
    test("Can create multiple tasks with same email", async () => {
      await knex(TASK_TABLE_NAME).del();
      await Task.createTask("First", "F", "test@email.com");
      await Task.createTask("Second", "F", "test@email.com");
      const res = await Task.getTasks("test@email.com");
      expect(res.length).toBe(2);
      expect(res[0].title).toBe("First");
      expect(res[1].title).toBe("Second");
    });
  });
  describe("Test Get Task function", () => {
    var task;
    beforeAll(async () => {
      await knex(TASK_TABLE_NAME).del();
      await Task.createTask("new", "neww", "test@email.com");
      const tasks = await Task.getTasks("test@email.com");
      task = tasks[0];
    });
    test("Get task if correct id given", async () => {
      const res = await Task.getTask(task.taskId);
      expect(res).toMatchObject(task);
    });
    test("Error if no id specified", async () => {
      expect.assertions(1);
      try {
        await Task.getTask();
      } catch (error) {
        expect(error.message).toBe(INVALID_ID);
      }
    });
    test("Error if incorrect id format specified", async () => {
      expect.assertions(1);
      try {
        await Task.getTask("121");
      } catch (error) {
        expect(error.message).toBe(INVALID_ID);
      }
    });
    test("Error if id if id non existent", async () => {
      expect.assertions(1);
      try {
        const res = await Task.getTask(8927493);
      } catch (error) {
        expect(error.message).toBe(TASK_NOT_FOUND);
      }
    });
  });
  describe("Test Get Tasks function", () => {
    beforeAll(async () => {
      await knex(TASK_TABLE_NAME).del();
    });
    test("Get zero tasks if no tasks created for user", async () => {
      const res = await Task.getTasks("test@email.com");
      expect(res.length).toBe(0);
    });
    test("Get correct number of tasks", async () => {
      await Task.createTask("Hadi", "Hadi", "test@email.com");
      const tasks = await Task.getTasks("test@email.com");
      expect(tasks.length).toBe(1);
    });
    test("Return empty array if user email does not exist", async () => {
      const res = await Task.getTasks("sss@gmail.com");
      expect(res.length).toBe(0);
    });
    test("Throw error if no email specified", async () => {
      expect.assertions(1);
      try {
        await Task.getTasks();
      } catch (error) {
        expect(error.message).toBe(EMPTY_FIELD);
      }
    });
    test("Throw error if non-email specified", async () => {
      expect.assertions(1);
      try {
        await Task.getTasks(123);
      } catch (error) {
        expect(error.message).toBe(INVALID_EMAIL);
      }
    });
  });
  describe("Test Update Task function", () => {
    var task;
    beforeAll(async () => {
      await knex(TASK_TABLE_NAME).del();
      await Task.createTask("original", "original", "test@email.com");
      const tasks = await Task.getTasks("test@email.com");
      task = tasks[0];
    });
    describe("Update task if correct parameters specified", () => {
      test("Update all parameters at once", async () => {
        await Task.updateTask(task.taskId, {
          title: "newTitle!",
          description: "New description!",
          completed: true,
        });
        const newTask = await Task.getTask(task.taskId);
        expect(newTask).not.toMatchObject(task);
        expect(newTask).toMatchObject({
          taskId: task.taskId,
          title: "newTitle!",
          description: "New description!",
          completed: 1,
        });
      });
      test("Update title", async () => {
        await Task.updateTask(task.taskId, {
          title: "onlyTitle!",
        });
        const newTask = await Task.getTask(task.taskId);
        expect(newTask).not.toMatchObject(task);
        expect(newTask).toMatchObject({
          taskId: task.taskId,
          title: "onlyTitle!",
          description: "New description!",
          completed: 1,
        });
      });
      test("Update description", async () => {
        await Task.updateTask(task.taskId, {
          description: "Only description!",
        });
        const newTask = await Task.getTask(task.taskId);
        expect(newTask).not.toMatchObject(task);
        expect(newTask).toMatchObject({
          taskId: task.taskId,
          title: "onlyTitle!",
          description: "Only description!",
          completed: 1,
        });
      });
      test("Update completed", async () => {
        await Task.updateTask(task.taskId, {
          completed: false,
        });
        const newTask = await Task.getTask(task.taskId);
        expect(newTask).not.toMatchObject(task);
        expect(newTask).toMatchObject({
          taskId: task.taskId,
          title: "onlyTitle!",
          description: "Only description!",
          completed: 0,
        });
      });
    });
    describe("Throw error if incorrect update object", () => {
      test("Extra field(s) specified", async () => {
        expect.assertions(1);
        try {
          await Task.updateTask(task.taskId, {
            title: "DAS",
            description: "asd",
            email: "dassad@gmail.com",
          });
        } catch (error) {
          expect(error.message).toBe(EXTRA_PARAMETERS);
        }
      });
      test("No field specified", async () => {
        expect.assertions(1);
        try {
          await Task.updateTask(task.taskId, {});
        } catch (error) {
          expect(error.message).toBe(EMPTY_FIELD);
        }
      });
      test("Invalid title format", async () => {
        expect.assertions(1);
        try {
          await Task.updateTask(task.taskId, { title: 121 });
        } catch (error) {
          expect(error.message).toBe(INVALID_TITLE);
        }
      });
      test("Invalid description format", async () => {
        expect.assertions(1);
        try {
          await Task.updateTask(task.taskId, { description: 121 });
        } catch (error) {
          expect(error.message).toBe(INVALID_DESCRIPTION);
        }
      });
      test("Invalid completed format", async () => {
        expect.assertions(1);
        try {
          await Task.updateTask(task.taskId, { completed: "yes" });
        } catch (error) {
          expect(error.message).toBe(INVALID_COMPLETED);
        }
      });
    });
  });
  describe("Test Delete Task function", () => {
    var task;
    beforeEach(async () => {
      await knex(TASK_TABLE_NAME).del();
      await Task.createTask("asdsad", "adsdsa", "test@email.com");
      const tasks = await Task.getTasks("test@email.com");
      task = tasks[0];
    });
    test("Delete task if it exists", async () => {
      let tasks = await Task.getTasks("test@email.com");
      expect(tasks.length).toBe(1);
      await Task.deleteTask(task.taskId);
      tasks = await Task.getTasks("test@email.com");
      expect(tasks.length).toBe(0);
    });
    describe("Throw error if incorrect parameters", () => {
      test("Throw error if incorrect id passsed", async () => {
        expect.assertions(1);
        try {
          await Task.deleteTask("ads");
        } catch (error) {
          expect(error.message).toBe(INVALID_ID);
        }
      });
      test("Throw error if task with given id does not exist", async () => {
        expect.assertions(1);
        try {
          await Task.deleteTask(6921);
        } catch (error) {
          expect(error.message).toBe(TASK_NOT_FOUND);
        }
      });
    });
  });
  describe("Test hasOwner Task function", () => {
    let taskOneId, taskTwoId;
    beforeAll(async () => {
      await User.createUser("Hadiw", "hadi@gmail.com", "hadi12345");
      await User.createUser("Hadiw", "hadi2@gmail.com", "hadi12345");
      await Task.createTask("tit1", "des1", "hadi@gmail.com");
      await Task.createTask("tit2", "des1", "hadi2@gmail.com");
      const tasksOne = await Task.getTasks("hadi@gmail.com");
      const tasksTwo = await Task.getTasks("hadi2@gmail.com");
      taskOneId = tasksOne[0].taskId;
      taskTwoId = tasksTwo[0].taskId;
    });
    test("Return true if owner does have task of given id", async () => {
      const res = await Task.hasOwner(taskOneId, "hadi@gmail.com");
      expect(res).toBe(true);
    });
    test("Return false if owner does not have task of given id", async () => {
      const res = await Task.hasOwner(taskTwoId, "hadi@gmail.com");
      expect(res).toBe(false);
    });
    test("Return false if owner does not exist", async () => {
      const res = await Task.hasOwner(taskOneId, "nonExistent@gmail.com");
      expect(res).toBe(false);
    });
    test("Return false if task id does not exist", async () => {
      const res = await Task.hasOwner(123, "hadi@gmail.com");
      expect(res).toBe(false);
    });

    describe("Test parameters", () => {
      test("Throw error if incorrect owner parameter(non-email string)", async () => {
        expect.assertions(1);
        try {
          const res = await Task.hasOwner(taskOneId, "ssssss");
        } catch (error) {
          expect(error.message).toBe(INVALID_EMAIL);
        }
      });
      test("Throw error if incorrect owner parameter(incorrect type)", async () => {
        expect.assertions(1);
        try {
          const res = await Task.hasOwner(taskOneId, 123);
        } catch (error) {
          expect(error.message).toBe(INVALID_EMAIL);
        }
      });
      test("Throw error if incorrect task id parameter(incorrect type)", async () => {
        expect.assertions(1);
        try {
          const res = await Task.hasOwner("ssss", "hadi@gmail.com");
        } catch (error) {
          expect(error.message).toBe(INVALID_ID);
        }
      });
    });
  });
});
