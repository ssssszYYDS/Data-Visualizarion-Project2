# ARTS1422 - Data - Visualization - Final Project

## Introduction

- Final Project for Data Visualization class(ARTS1422) in Shanghaitech, spring, 2024.
- The project frame is based on Vue 3 and Vite.
- Group members: 夏康杰, 王芸飞, 贾舜康

## Components Introduction

- Calendar(Upper Left, named Calendar): shows the date from 2022-03-01 to 2023-05-24.
- Map(Middle): shows the building and daily traffic conditions and daily participant routines in Shanghaitech City.
- Cluster Graph(Upper Right, named Different Life Patterns): shows the clustering of participants in the Shanghaitech city.
- River Map(Lower Middle): shows changes in the activities carried out by all participants in the Shanghaitech city over the course of a day.
- Bar, Line Mixed Chart(Lower Left, named Monthly Expenditure): shows an overview of all participants total consumption(time + money) monthly.
- Pie Chart(Middle Right): shows an overview of two participants consumption(time + money) habit.
- Bar chart(Lower Right, named Daily Routine): shows the daily routine of two participants.

## The Visualization System

![overview](/Img/overview.png)

## What operations can do

- Click on the Calendar to select the expected date and the corresponding changes will be shown in the Daily Routine and the River Map.
- By clicking on the expected points in the Different Life Patterns, Daily Routine and Pie charts will change accordingly.
- Legend in some components can also be clicked, and the corresponding part will be hidden.
- Most of the places have mouseover interactions, and you can see the details of their properties by moving the mouse to the corresponding location

## How to run code

- Step 1: Install dependencies
  
  ```bash
  # Run in the project root directory
  pnpm install
  ```

- Step 2: Run frame
  - Step 2.0: Start front and back end at once
  
    ```bash
    # Run in the project root directory
    pnpm start
    ```

  - Step 2.1: Start front and back end respectively(recommend way)
  
    ```bash
    # Run server
    cd packages/server
    npm run server
    ```

    ```bash
    # Run client
    cd packages/client
    npm run start
    ```

- Step 3: Local viewing
  - open website `http://localhost:8086/`

- Step 4: Build file (Optional)

  ```bash
  cd packages/client
  npm run build
  ```