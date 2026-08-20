<div align="center">
  <img src="frontend_example/public/logo.png" alt="GREENN logo" width="180" />
</div>

# GREENN

**Granular Evaluation of Energy Efficiency in Neural Networks**

[![Demo](https://img.shields.io/badge/status-demo-3f7658?style=flat-square)](frontend_example/)
[![React](https://img.shields.io/badge/React-19-20232a?style=flat-square&logo=react&logoColor=61DAFB)](frontend_example/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](frontend_example/)
[![License](https://img.shields.io/badge/license-not%20specified-lightgrey?style=flat-square)](#)

## Description

In recent years, the use of Artificial Intelligence has experienced exponential growth. However, this development has also raised a new concern: the high energy consumption associated with the life cycle of its models and their environmental impact. Deep learning neural networks and, in particular, convolutional networks, are among the models that consume the most computational resources during their training.

GREENN (Granular Evaluation of Energy Efficiency in Neural Networks) was created to help users understand the energy behaviour of their neural networks and choose an architecture that balances performance and sustainability. It measures and analyses training energy consumption at different levels of granularity: the complete training process, individual epochs and the layers that make up a neural network. Reports include total execution time, energy consumed by each hardware component, carbon emissions and model-performance metrics such as accuracy and F1-score.


## About This Repository

This repository contains a public demonstration version of GREENN, a web application for exploring the energy efficiency of neural network training. The demo presents the main user experience and application workflows, including:

- Managing projects and test cases.
- Configuring datasets, models, training parameters and hardware measurements.
- Exploring training, energy and carbon-emissions results through charts and detailed views.
- Inspecting measurements at training, epoch and neural-network layer level.
- Accessing and exporting generated reports.

GREENN was developed within the [ALARCOS Research Group](https://alarcos.esi.uclm.es/) at the University of Castilla-La Mancha as a **Final Degree Project**. The project received a final grade of **10/10**.

## Demo Scope

This is a demo version intended to communicate the application's concepts, interface and analysis workflows. The original production code is not included because GREENN is planned to become part of a larger tool currently being developed within the research laboratory.

The complete production implementation, backend services and future integrated version are therefore outside the scope of this repository. The included frontend can be used to inspect the demo interface and its example data.

## Running the Frontend Demo

The frontend is located in [`frontend_example`](frontend_example/). To install its dependencies and start the Vite development server:

```bash
cd frontend_example
npm install
npm run dev
```

See the [frontend README](frontend_example/README.md) for the technology stack, project structure and deployment notes.

## Further Information

- [Research paper](https://ieeexplore.ieee.org/document/11500254)  
	DOI: `10.1109/SANER-C67878.2026.00028`

- [Laboratory blog post with further explanation and video](https://esi.uclm.es/index.php/2025/12/04/evaluacion-del-consumo-de-energia-del-entrenamiento-de-redes-neuronales/)

