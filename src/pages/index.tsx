import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Button } from "@material-ui/core";

type TODOData = {
  done: boolean;
  id: string;
  task: string;
};
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& > *": {
        margin: theme.spacing(1),
        width: "25ch",
      },
    },
  })
);

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
  mutation addTodo($task: String!) {
    addTodo(task: $task) {
      id
      task
      done
    }
  }
`;

const UPDATE_TASK = gql`
  mutation checkedTodo($id: ID!, $done: Boolean) {
    checkedTodo(id: $id, done: $done) {
      id
      done
    }
  }
`;

const Home = () => {
  const [task, setTask] = useState("");

  const [addTodo] = useMutation(ADD_TODO);
  const addTask = () => {
    addTodo({
      variables: {
        task: task,
      },
      refetchQueries: [{ query: GET_TODOS }],
    });
  };

  const [checkedTodo] = useMutation(UPDATE_TASK);

  const { loading, error, data } = useQuery(GET_TODOS);

  const classes = useStyles();

  if (loading) {
    return <CircularProgress variant="static" value={25} />;
  }

  if (error) {
    return (
      <Alert severity="error">This is an error alert — check it out!</Alert>
    );
  }
  return (
    <div>
      <h1>TODO APP</h1>
      <form className={classes.root} noValidate autoComplete="off">
        <TextField
          id="outlined-basic"
          label="Outlined"
          variant="outlined"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
        />
      </form>
      <Button variant="contained" color="primary" onClick={addTask}>
        Add Task
      </Button>
      {data && console.log(data.todos)}

      {data &&
        data.todos.map((d: TODOData) => {
          return (
            <FormGroup row key={d.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={d.done}
                    onClick={async () => {
                      checkedTodo({
                        variables: {
                          id: d.id,
                          done: !d.done,
                        },
                        refetchQueries: [{ query: GET_TODOS }],
                      });
                    }}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={d.task}
              />
            </FormGroup>
          );
        })}
    </div>
  );
};

export default Home;
