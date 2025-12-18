import { Card } from "@/components/ui/card";
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
import { useTranslation } from "react-i18next";
import React from "react";

const General = () => {
  const { t } = useTranslation("general");
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
    <Card className="p-6">
      <form className="flex flex-wrap gap-4 justify-start items-start text-start">
        <article className="w-full gap-y-2">
          <Label htmlFor="title">{t("title.name")}</Label>
          <Input
            id="title"
            name="title"
            value={general.title}
            onChange={update}
            placeholder={t("title.placeholder")}
          />
        </article>
        <article className="gap-y-2">
          <Label htmlFor="subtitle">{t("subtitle.name")}</Label>
          <Input
            id="subtitle"
            name="subtitle"
            value={general.subtitle}
            onChange={update}
            placeholder={t("subtitle.placeholder")}
          />
        </article>
        <article className="gap-y-2">
          <Label htmlFor="author">{t("author.name")}</Label>
          <Input
            id="author"
            name="author"
            value={general.author}
            onChange={update}
            placeholder={t("author.placeholder")}
          />
        </article>
        <article className="gap-y-2">
          <Label id="genre">{t("genre.name")}</Label>
          <Select
            value={general.genre ?? undefined}
            onValueChange={(value) => updateSelect("genre", value)}
          >
            <SelectTrigger aria-labelledby="genre">
              <SelectValue data-testid="select-genre" placeholder={t("genre.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sci-fi">{t("genre.options.scienceFiction")}</SelectItem>
              <SelectItem value="selfHelp">{t("genre.options.selfHelp")}</SelectItem>
              <SelectItem value="non-fiction">{t("genre.options.nonFiction")}</SelectItem>
              <SelectItem value="fantasy">{t("genre.options.fantasy")}</SelectItem>
              <SelectItem value="mystery">{t("genre.options.mystery")}</SelectItem>
              <SelectItem value="romance">{t("genre.options.romance")}</SelectItem>
              <SelectItem value="thriller">{t("genre.options.thriller")}</SelectItem>
              <SelectItem value="biography">{t("genre.options.biography")}</SelectItem>
            </SelectContent>
          </Select>
        </article>
        <article className="gap-y-2">
          <Label htmlFor="series">{t("series.name")}</Label>
          <Input
            id="series"
            name="series"
            value={general.series}
            onChange={update}
            placeholder={t("series.placeholder")}
          />
        </article>
        <article className="gap-y-2">
          <Label htmlFor="volume">{t("volume.name")}</Label>
          <Input
            id="volume"
            type="number"
            min="1"
            max="999"
            name="volume"
            value={general.volume}
            onChange={update}
            placeholder={t("volume.placeholder")}
          />
        </article>
        <article className="w-full gap-y-2">
          <Label id="license">{t("license.name")}</Label>
          <Select
            value={general.license ?? undefined}
            onValueChange={(value) => updateSelect("license", value)}
          >
            <SelectTrigger aria-labelledby="license">
              <SelectValue placeholder={t("license.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="copyright">{t("license.options.allRightsReserved")}</SelectItem>
              <SelectItem value="cc-by">{t("license.options.ccBy")}</SelectItem>
              <SelectItem value="cc-by-sa">{t("license.options.ccBySa")}</SelectItem>
              <SelectItem value="cc-by-nc">{t("license.options.ccByNc")}</SelectItem>
              <SelectItem value="public-domain">{t("license.options.publicDomain")}</SelectItem>
              <SelectItem value="withoutLicense">{t("license.options.withoutLicense")}</SelectItem>
            </SelectContent>
          </Select>
        </article>
      </form>
    </Card>
  );
};
export default General;
