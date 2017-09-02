__author__ = 'QSG'
import unittest
import HTMLTestRunner
import os, time

# Directory for locating test cases
# tests/seleniumPythonTest/run_all_tests.py
test_dir= os.path.dirname(os.path.abspath('.'))
test_case_dir=test_dir+'/test_case/'
test_reports_dir=test_dir+'/seleniumPythonTest/test_reports/'
print test_reports_dir
def creatsuite():
    testunit=unittest.TestSuite()
    #Define discover selenium py test files to find py test cases.
    discover=unittest.defaultTestLoader.discover(test_dir,
                    pattern ='slnm_test*.py',
                    top_level_dir=None)

    #Add test cases to the test suits
    for test_suite in discover:
        # print test_suite,'\n'
        for test_case in test_suite:
            testunit.addTests(test_case)
            print testunit
    return testunit
alltestnames = creatsuite()
now = time.strftime('%m-%d-%Y-%H_%M_%S',time.localtime(time.time()))

filename = test_reports_dir+now+'result.html'
fp = file(filename, 'wb')
runner =HTMLTestRunner.HTMLTestRunner(
    stream=fp,
    title=u'Settler of Massey Selenium Test Report',
    description=u'Results of the tests:')

#Running the test cases.
runner.run(alltestnames)
