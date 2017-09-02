__author__ = 'QSG'
import unittest
import HTMLTestRunner
import os, time
# import stringIO

# Directory for locating test cases
test_dir='.\\test_case'
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
            # print testunit
    return testunit
alltestnames = creatsuite()
now = time.strftime('%m-%d-%Y-%H_%M_%S',time.localtime(time.time()))

filename = '.\\test_reports\\'+now+'result.html'
fp = file(filename, 'wb')
runner =HTMLTestRunner.HTMLTestRunner(
    stream=fp,
    title=u'Settler of Massey Selenium Test Report',
    description=u'Results of the tests:')

#Running the test cases.
runner.run(alltestnames)
