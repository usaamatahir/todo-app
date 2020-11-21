import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";

const GET_TODOS = gql`
  query {
    todos {
      id
      task
      done
    }
  }
`;

const ADD_TODO = gql`
  mutation addTodo($task: String) {
    addTodo(task: $task) {
      id
      task
      done
    }
  }
`;

const Home = () => {
  const [addTodo] = useMutation(ADD_TODO);
  const addTask = () => {
    addTodo({
      variables: {
        task: "Coding",
      },
    });
  };
  const { loading, error, data } = useQuery(GET_TODOS);
  return (
    <div>
      <h1>Helo</h1>
      <button onClick={addTask}>Add Task</button>
      {console.log(JSON.stringify(data))}
    </div>
  );
};

export default Home;
