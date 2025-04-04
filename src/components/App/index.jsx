import {useState} from 'react';
import { Helmet } from 'react-helmet';
import {appConfig} from '../../data/config';

/** @jsx jsx */
import { ThemeProvider, jsx } from 'theme-ui'
import { Button, Flex,  Container, Heading, Paragraph, Image} from 'theme-ui'
import { theme } from '../../data/theme'

// Components
import Questions from '../QuestionAnswer'
import grids from '../../data/grids';
import PrintableSvgDiv from '../PrintableSvgDiv'
import PreviewSvg from '../PreviewSvgDiv';
import GridIcon from '../GridIcon'
import {ClearModal, LoadModal, SaveModal} from '../Modal'

// Data
import shuffleImg from '../../data/shuffle.png'
import iconBigHex from '../../data/iconBigHex.png'
import iconBigTriangle from '../../data/iconBigTriangle.png'
import iconSmallHex from '../../data/iconSmallHex.png'
import iconSmallTriangle from '../../data/iconSmallTriangle.png'

// Functions
import {generateSaveCode, parseSaveCode, generateAndSavePdf} from '../../utils/saveLoadExport'
import {generateMapping, mapKeys, getMaxIndex} from '../../utils/shuffeArray'
import {calculateGridParameters} from '../../utils/grid'

const App = (id) => {
  const [loadedQuestions, setLoadedQuestions] = useState({
    '1': ['Write','your questions here...'],
    '2': ['The small shapes', 'above the diagram...'],
    // '3': ['âçğıİîöşüûÂÇĞIİÎÖŞÜÛ'] // testing extended latin characters
  })
  const [loadedAnswers, setLoadedAnswers] = useState({
    '1': ['and your answers', 'here! Or vice versa.'],
    '2': ['change the puzzle shape.']
  })
  const [questions, setQuestions] = useState(loadedQuestions)
  const [answers, setAnswers] = useState(loadedAnswers)
  const [loadCount, setloadCount] = useState(0)
  const [grid, setGrid] = useState(grids.triangleGrid)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveString, setSaveString] = useState('')
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false) 
  const gridParams = calculateGridParameters(grid) // not sure this is the best place for this calculation

  const hideModals = () => {
    setShowSaveModal(false)
    setShowLoadModal(false)
    setShowClearModal(false)
  }
  const exportToPdf = () => {
    const saveCode = generateSaveCode(questions, answers, grid)
    const previewSvg = document.getElementById('previewSvg')
    const printSvgs = document.getElementById('printSvgDiv').children
    generateAndSavePdf(saveCode, previewSvg, printSvgs, appConfig.pdf)
  };
  const saveToText = () => {
    var saveCode = generateSaveCode(questions, answers, grid)
    //Show output modal
    setSaveString(saveCode)
    setShowSaveModal(true)
  }
  const loadModalShow = () => {
    setShowLoadModal(true)
  }
  const valuesForInputs = (questionValues, answerValues, gridValue) => {
    // Set states
    setGrid(gridValue)
    setLoadedQuestions(questionValues)
    setQuestions(questionValues)
    setLoadedAnswers(answerValues)
    setAnswers(answerValues)
    // Increment load count (to trigger re-render of Questions)
    setloadCount(loadCount+1)
  }
  const loadFromText = (text) => {
    if (text) { 
      try {
        var {promptQ, promptA, promptGrid} = parseSaveCode(text)
        valuesForInputs(promptQ, promptA, promptGrid)
      }
      catch {
        window.alert('Invalid tarsia code.')
      }
    }
  }
  const clearModalShow = () => {
    setShowClearModal(true)
  }
  const clearInputs = () => {
      valuesForInputs({}, {}, grid)
  }
  const onInputChange = ({name, questionNumber, value}) => {
    if (name === 'q') {
        setQuestions((questions) => ({...questions, [questionNumber]:value}))
      } else if (name === 'a') {
        setAnswers((answers) => ({...answers, [questionNumber]:value}))
      }
  }

  const shuffleOrder = () => {
    // Get max index
    let maxIndex = getMaxIndex(gridParams, questions, answers)

    // Generate mapping
    let mapping = generateMapping(maxIndex, 1)
    
    // Generate new dictionaries
    let newQuestions = mapKeys(questions, mapping)
    let newAnswers = mapKeys(answers, mapping)

    // Update states
    valuesForInputs(newQuestions, newAnswers, grid)
  }

  return (
    <ThemeProvider theme={theme}>
        <Helmet>
          <title>Tarsia Maker</title>
          <meta property='description' content='A simple, online editor for Tarsia puzzles.' />
          <meta property='theme-color' content="#607d86" />
          <meta property='title' content='Tarsia Maker' />
          <meta property='og:title' content='Tarsia Maker' />
          <meta property='og:type' content='website' />
          <meta property='og:url' content='https://www.suveerkh.github.io/tarsia-generator/' />
          <meta property='og:description' content='A simple, online editor for Tarsia puzzles.' />
          <meta property='og:image' content='https://i.postimg.cc/MTnhLVH3/preview-image.png' />
        </Helmet>
        
        <Container variant='header'>
          <Heading>Tarsia Maker</Heading>
        </Container>
        
        <Container variant='body'>
          <Flex variant='layout.menu'>
            <GridIcon ariaLabel='Small triangle grid' icon={iconSmallTriangle} onClick={() => setGrid(grids.smallTriangleGrid)}/>
            <GridIcon ariaLabel='Small hexagon grid' icon={iconSmallHex} onClick={() => setGrid(grids.smallHexGrid)}/>
            <GridIcon ariaLabel='Large triangle grid' icon={iconBigTriangle} onClick={() => setGrid(grids.triangleGrid)}/>
            <GridIcon ariaLabel='Large hexagon grid' icon={iconBigHex} onClick={() => setGrid(grids.hexGrid)}/>  
          </Flex>
          <Container variant='previewSvg'>
            <PreviewSvg id='tarsiaPreview' grid={grid} gridParams={gridParams} questions={questions} answers={answers}/>
          </Container>
          <Flex variant='layout.menu'>
            <Button onClick={exportToPdf}>Export to PDF</Button>
            <Button onClick={saveToText}>Save</Button>
            <Button onClick={loadModalShow}>Load</Button>
            <Button onClick={clearModalShow}>Clear</Button>
            <Button onClick={shuffleOrder}><Image src={shuffleImg} variant='images.shuffleIcon'/></Button>
          </Flex>
          <Questions onChange={(data) => onInputChange(data)} nQuestions={gridParams.nQuestions} loadedQuestions={loadedQuestions} loadedAnswers={loadedAnswers} key={`questions-${loadCount}`}/>
        </Container>

        <Container variant='footer'>
          <Container variant='body'>
            <Paragraph mb={2}>Feedback or ideas? <a href='mailto:suveerkh@gmail.com'>Email me</a>.</Paragraph>
            <Paragraph mb={2}>My <a href='https://bit.ly/phantomgames'>website</a>.</Paragraph>
          </Container>
        </Container>

        <SaveModal handleClose={hideModals} show={showSaveModal} saveString={saveString}/>
        <LoadModal key={`loadModal-${loadCount}`} handleClose={hideModals} show={showLoadModal} loadFromText={loadFromText}></LoadModal>
        <ClearModal handleClose={hideModals} show={showClearModal} clearInputs={clearInputs}></ClearModal>
        
        <Container variant='hidden'>
          <PrintableSvgDiv id='printSvgDiv' grid={grid} questions={questions} answers={answers}/>
        </Container>
    </ThemeProvider>
  );
}

export default App;
