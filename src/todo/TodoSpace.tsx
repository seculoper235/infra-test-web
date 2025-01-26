import {Delete} from "@mui/icons-material"
import {
    Checkbox,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    Stack,
    TextField,
    Typography
} from "@mui/material"
import {pipe} from "fp-ts/function"
import * as A from "fp-ts/ReadonlyArray"
import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react"
import TitleBar from "../common/compoent/TitleBar.tsx"
import {useHandleCallback} from "../common/Http.ts"
import {useTodoService} from "../service/TodoService.ts"
import {TodoItem} from "../state/Todo.ts"

const TodoSpace = () => {
    const [items, setItems] = useState<ReadonlyArray<TodoItem>>(A.empty)
    const service = useTodoService()
    const handleResponse = useHandleCallback()

    const [loaded, setLoaded] = useState(false)
    const [text, setText] = useState("")

    const todoItems: ReadonlyArray<TodoItem> = useMemo(() => {
        return pipe(
            items,
            A.filter(item => !item.completed)
        )
    }, [items])

    const doneItems: ReadonlyArray<TodoItem> = useMemo(() => {
        return pipe(
            items,
            A.filter(item => item.completed)
        )
    }, [items])

    const onChangeText = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value)
    }, [])

    const onDelete = useCallback((id: number) => {

        pipe(
            service.delete(id),
            handleResponse(() => {
                setLoaded(false)
            })
        )()
    }, [handleResponse, service])

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key != "Enter") return

        event.preventDefault()

        const content = text.trim()

        if (content == "") return

        pipe(
            service.register(content),
            handleResponse(() => {
                setText("")
                setLoaded(false)
            })
        )()
    }, [handleResponse, service, text])

    const onChangeStatus = useCallback((event: ChangeEvent<HTMLInputElement>, id: number) => {
        pipe(
            service.changeStatus(event.target.checked, id),
            handleResponse(() => {
                setLoaded(false)
            })
        )()
    }, [handleResponse, service])

    const appendItems = useCallback(() => {
        pipe(
            service.find(),
            handleResponse((res) => {
                setItems(res)
            })
        )()
    }, [handleResponse, service])

    useEffect(() => {
        if (!loaded) {
            appendItems()
            setLoaded(true)
        }
    }, [appendItems, loaded])

    return <>
        <TitleBar title={"Todo"}/>
        <Stack id={"todo-space"} height={"inherit"} pt={"64px"} direction={"row"}>
            <Stack flexGrow={1} pt={"10px"}>
                <Typography variant={"h3"}>할 일 목록</Typography>
                <ListItem>
                    <TextField fullWidth
                               variant={"outlined"}
                               placeholder={"내용을 입력해주세요"}
                               value={text}
                               onChange={onChangeText}
                               onKeyDown={handleKeyDown}/>
                </ListItem>
                {A.isEmpty(todoItems) ?
                    <Typography variant={"h2"}>해야 할 일을 작성해보세요!</Typography> :
                    <List>
                        {todoItems.map((item) => (
                            <ListItem key={item.id}
                                      secondaryAction={
                                          <IconButton edge="end" onClick={() => onDelete(item.id)}>
                                              <Delete/>
                                          </IconButton>
                                      }>
                                <ListItemIcon>
                                    <Checkbox checked={item.completed}
                                              onChange={(e) => onChangeStatus(e, item.id)}/>
                                </ListItemIcon>
                                <TextField fullWidth
                                           variant={"outlined"}
                                           placeholder={"내용을 입력해주세요"}
                                           value={item.title}/>
                            </ListItem>
                        ))}
                    </List>
                }
            </Stack>

            <Stack flexGrow={1} pt={"10px"}>
                <Typography variant={"h3"}>완료한 일 목록</Typography>
                {A.isEmpty(doneItems) ?
                    <Typography variant={"h4"}>아직 일을 끝내지 못했나요?</Typography> :
                    <List>
                        {doneItems.map((item) => (
                            <ListItem key={item.id}
                                      secondaryAction={
                                          <IconButton edge="end" onClick={() => onDelete(item.id)}>
                                              <Delete/>
                                          </IconButton>
                                      }>
                                <ListItemIcon>
                                    <Checkbox checked={item.completed}
                                              onChange={(e) => onChangeStatus(e, item.id)}/>
                                </ListItemIcon>
                                <TextField fullWidth variant={"outlined"} value={item.title}
                                           disabled/>
                            </ListItem>
                        ))}
                    </List>
                }
            </Stack>
        </Stack>
    </>
}

export default TodoSpace
