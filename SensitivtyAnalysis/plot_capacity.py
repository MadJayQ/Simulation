import json
import pandas as pd
from statsmodels.formula.api import ols
import numpy as np
import matplotlib
matplotlib.use('pdf')
import matplotlib.pyplot as plt

'''
ts = pd.Series(np.random.randn(1000), index=pd.date_range('1/1/2000', periods=1000))
ts = ts.cumsum()
ts.plot()
plt.savefig('test.pdf') 
'''
finaldata = {
    'capacity_multiplier': [],
    'number_of_iterations': [],
};
with open('./export.json', 'r') as f:
    data = json.load(f)
for run in data:
    finaldata["capacity_multiplier"].append(data[run]["label"]);
    finaldata["number_of_iterations"].append(data[run]["avgItrs"]);
df = pd.DataFrame(data=finaldata)
df = df.sort_values(by='capacity_multiplier', ascending=True)
test = ols("capacity_multiplier ~ number_of_iterations", data=df).fit()
df.plot.bar(x='capacity_multiplier', y='number_of_iterations', rot=0)
plt.savefig('test.pdf')
print(test.params)
print(test.summary())
