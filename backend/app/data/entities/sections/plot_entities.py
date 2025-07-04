from sqlalchemy import Column, Integer, String, Text, ForeignKey

from backend.app.data.entities.project_entities import Base
from backend.app.data.helpers.json_list_encoder_helper import JSONEncodedList


# ───── Plot ─────
class Plot(Base):
    __tablename__ = "plots"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(Text)
    plotStepsResume = Column(Text)
    result = Column(Text)
    importance = Column(Integer)
    chapterReferencesIDs = Column(JSONEncodedList)
    characterReferencesIDs = Column(JSONEncodedList)
    projectID = Column(Integer, ForeignKey("base_projects.id"))


# ───── PlotStep ─────
class PlotStep(Base):
    __tablename__ = "plot_steps"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    nextStepID = Column(Integer, ForeignKey("plot_steps.id"))
    previousStepID = Column(Integer, ForeignKey("plot_steps.id"))
    goal = Column(Text)
    plotID = Column(Integer, ForeignKey("plots.id"))
