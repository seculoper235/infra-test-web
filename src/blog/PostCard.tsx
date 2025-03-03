import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia,
    Skeleton,
    Typography
} from "@mui/material"
import dayjs from "dayjs"
import {Fragment} from "react"
import {useNavigate} from "react-router-dom"
import Reference from "../../public/asset/image/reference.jpg"
import {Post} from "./state/Post.ts"

type PostCardProps = {
    item: Post,
    busy: boolean
}
const PostCard = ({item, busy}: PostCardProps) => {
    const navigate = useNavigate()

    return <Card sx={{width: 350}}>
        {busy ? (
            <Fragment>
                <Skeleton sx={{height: 200, marginBottom: 3}}
                          animation="wave"
                          variant="rectangular"/>
                <CardContent>
                    <Skeleton animation="wave" height={10}
                              style={{marginBottom: 6}}/>
                    <Skeleton animation="wave" height={10}
                              width="80%"/>
                </CardContent>
            </Fragment>
        ) : (
            <CardActionArea
                onClick={() => navigate("/post/" + item.id)}>
                <CardMedia
                    component="img"
                    height="200"
                    image={Reference}
                    alt="default image"
                />
                <CardContent sx={{textAlign: "left"}}>
                    <Typography gutterBottom sx={{
                        color: "text.primary",
                        fontSize: 18
                    }}>
                        A beautiful day
                    </Typography>
                    <Typography sx={{
                        color: "text.secondary",
                        fontSize: 14
                    }}>
                        Lorem Ipsum is simply dummy text of the printing
                        and typesetting industry.
                    </Typography>
                </CardContent>
            </CardActionArea>
        )}
        <CardActions style={{justifyContent: "flex-end"}}>
            {!busy && <>
              <Button variant={"text"} size="small">
                <Typography sx={{
                    color: "text.secondary",
                    fontSize: 12
                }}>
                    {dayjs(item.created).format("YYYY년 MM월 DD일")}
                </Typography>
              </Button>
              <Box flexGrow={1}/>
              <Button variant={"text"} size="small">
                <Typography style={{
                    fontFamily: "KyoboHandwriting2023wsa",
                    fontSize: 14
                }}>
                  by 핑핑
                </Typography>
              </Button>
            </>}
        </CardActions>
    </Card>
}

export default PostCard
