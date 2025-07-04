from sqlalchemy import select
from typing import Sequence, Any

from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.data.entities.sections.plot_entities import Plot, PlotStep
from backend.app.data.entities.sections.world_entities import World, WorldElement


class PlotRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_plots_by_project_id(self, project_id: int) -> Sequence[Plot]:
        plot_result = await self.session.execute(
            select(Plot).where(Plot.projectID == project_id)
        )
        return plot_result.scalars().all()

    async def get_plot(self, plot_id: int) -> Plot:
        plot_result = await self.session.execute(select(Plot).where(Plot.id == plot_id))
        return plot_result.scalar_one_or_none()

    async def get_plot_step(self, plot_step_id: int) -> PlotStep:
        plot_step_result = await self.session.execute(
            select(PlotStep).where(PlotStep.id == plot_step_id)
        )
        return plot_step_result.scalar_one_or_none()

    async def get_plot_step_list(self, plot_id: int) -> Sequence[PlotStep]:
        plot_steps_result = await self.session.execute(
            select(PlotStep).where(PlotStep.plotID == plot_id)
        )
        return plot_steps_result.scalars().all()

    async def create_plot(self, project_id: int) -> Plot:
        plot = Plot(projectID=project_id, importance=0)
        self.session.add(plot)
        await self.session.commit()
        await self.session.refresh(plot)
        return plot

    async def create_plot_step(self, plot_id: int) -> PlotStep:
        new_element = PlotStep(plotID=plot_id)
        self.session.add(new_element)
        await self.session.commit()
        await self.session.refresh(new_element)
        return new_element

    async def update_plot(self, plot_to_update: Plot):
        await self.session.commit()
        await self.session.refresh(plot_to_update)

    async def update_plot_step(self, plot_step_to_update: PlotStep):
        await self.session.commit()
        await self.session.refresh(plot_step_to_update)

    async def delete_plot(self, plot: Plot):
        await self.session.delete(plot)
        await self.session.commit()

    async def delete_plot_step(self, plot_step: PlotStep):
        await self.session.delete(plot_step)
        await self.session.commit()
