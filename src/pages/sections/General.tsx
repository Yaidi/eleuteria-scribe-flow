import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {Label} from "@/components/ui/label.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/config.tsx";
import {updateGeneral} from "@/store/sections/action.ts";
import {useEffect, useState} from "react";
import {IGeneral} from "@/types/sections.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const General = () => {
    const { general } = useSelector((state: RootState) => state.sections)
    const [info, setInfo] = useState<IGeneral>(general)
    const dispatch = useDispatch()

    useEffect(() => {
        setInfo(general)
    }, [general])

    const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        const updated = { ...info, [name]: value }
        setInfo(updated)
        dispatch(updateGeneral({ [name]: value }))
    }
    const updateSelect = (name: string, value: string) => {
        const updated = { ...info, [name]: value }
        setInfo(updated)
        dispatch(updateGeneral({ [name]: value }))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={info.title}
                            onChange={update}
                            placeholder="Enter book title"
                        />
                    </div>
                    <div>
                        <Label htmlFor="author">Author</Label>
                        <Input
                            id="author"
                            name="author"
                            value={info.author}
                            onChange={update}
                            placeholder="Enter author name"
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                        id="subtitle"
                        name="subtitle"
                        value={info.subtitle}
                        onChange={update}
                        placeholder="Enter subtitle (optional)"
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="series">Series</Label>
                        <Input
                            id="series"
                            name="series"
                            value={info.series}
                            onChange={update}
                            placeholder="Series name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="volume">Volume</Label>
                        <Input
                            id="volume"
                            type="number"
                            min="1"
                            max="999"
                            name="volume"
                            value={info.volume}
                            onChange={update}
                            placeholder="Volume number"
                        />
                    </div>
                    <div>
                        <Label htmlFor="genre">Genre</Label>
                        <Select value={info.genre} onValueChange={(value) => updateSelect('genre', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fiction">Fiction</SelectItem>
                                <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                                <SelectItem value="fantasy">Fantasy</SelectItem>
                                <SelectItem value="sci-fi">Science Fiction</SelectItem>
                                <SelectItem value="mystery">Mystery</SelectItem>
                                <SelectItem value="romance">Romance</SelectItem>
                                <SelectItem value="thriller">Thriller</SelectItem>
                                <SelectItem value="biography">Biography</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <Label htmlFor="license">License</Label>
                    <Select value={info.license} onValueChange={(value) => updateSelect('license', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select license" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="copyright">All Rights Reserved</SelectItem>
                            <SelectItem value="cc-by">Creative Commons BY</SelectItem>
                            <SelectItem value="cc-by-sa">Creative Commons BY-SA</SelectItem>
                            <SelectItem value="cc-by-nc">Creative Commons BY-NC</SelectItem>
                            <SelectItem value="public-domain">Public Domain</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
export default General;
