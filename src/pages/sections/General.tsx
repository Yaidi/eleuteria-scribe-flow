import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.ts";
import { updateGeneral } from "@/store";
import { IGeneral } from "@/types/sections.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useProjectId } from "@/hooks/useSections.ts";

const General = () => {
  const { general } = useSelector((state: RootState) => state.sections);
  const projectId = useProjectId();
  const dispatch = useDispatch<AppDispatch>();

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { [name]: value };
    dispatch(updateGeneral({ projectId: projectId, general: updated }));
  };
  const updateSelect = (name: string, value: string) => {
    const updated: Partial<IGeneral> = { [name]: value };
    dispatch(updateGeneral({ projectId: projectId, general: updated }));
  };

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
              value={general.title}
              onChange={update}
              placeholder="Enter book title"
            />
          </div>
          <div>
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              name="author"
              value={general.author}
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
            value={general.subtitle}
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
              value={general.series}
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
              value={general.volume}
              onChange={update}
              placeholder="Volume number"
            />
          </div>
          <div>
            <Label id="genre">Genre</Label>
            <Select value={general.genre} onValueChange={(value) => updateSelect("genre", value)}>
              <SelectTrigger aria-labelledby="genre">
                <SelectValue data-testid="select-genre" placeholder="Select genre" />
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
          <Label id="license">License</Label>
          <Select value={general.license} onValueChange={(value) => updateSelect("license", value)}>
            <SelectTrigger aria-labelledby="license">
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
};
export default General;
